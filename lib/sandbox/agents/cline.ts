import { Sandbox } from '@vercel/sandbox'
import { Writable } from 'stream'
import { runCommandInSandbox, runInProject, PROJECT_DIR } from '../commands'
import { AgentExecutionResult } from '../types'
import { redactSensitiveInfo } from '@/lib/utils/logging'
import { TaskLogger } from '@/lib/utils/task-logger'
import { connectors, taskMessages } from '@/lib/db/schema'
import { db } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'

type Connector = typeof connectors.$inferSelect

// Helper function to run command and collect logs in project directory
async function runAndLogCommand(sandbox: Sandbox, command: string, args: string[], logger: TaskLogger) {
  const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command
  const redactedCommand = redactSensitiveInfo(fullCommand)

  await logger.command(redactedCommand)

  const result = await runInProject(sandbox, command, args)

  if (result && result.output && result.output.trim()) {
    const redactedOutput = redactSensitiveInfo(result.output.trim())
    await logger.info(redactedOutput)
  }

  if (result && !result.success && result.error) {
    const redactedError = redactSensitiveInfo(result.error)
    await logger.error(redactedError)
  }

  if (!result) {
    const errorResult = {
      success: false,
      error: 'Command execution failed - no result returned',
      exitCode: -1,
      output: '',
      command: redactedCommand,
    }
    await logger.error('Command execution failed - no result returned')
    return errorResult
  }

  return result
}

export async function installClineCLI(
  sandbox: Sandbox,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[],
): Promise<{ success: boolean }> {
  // Check if Cline CLI is already installed
  const existingCLICheck = await runCommandInSandbox(sandbox, 'which', ['cline'])

  let clineInstall: { success: boolean; output?: string; error?: string } = { success: true }

  if (existingCLICheck.success && existingCLICheck.output?.includes('cline')) {
    await logger.info('Cline CLI already installed, skipping installation')
  } else {
    await logger.info('Installing Cline CLI...')
    clineInstall = await runCommandInSandbox(sandbox, 'npm', ['install', '-g', 'cline'])
  }

  if (clineInstall.success) {
    await logger.info('Cline CLI installed successfully')

    // Check for OpenRouter API key
    if (process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
      await logger.info('Setting up Cline CLI authentication...')

      // Use OpenRouter as the primary provider for Cline
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
      const provider = process.env.OPENROUTER_API_KEY ? 'openrouter' : (process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai')

      await logger.info(`Using ${provider} for Cline authentication`)

      // Create config directory
      await runCommandInSandbox(sandbox, 'mkdir', ['-p', '$HOME/.config/cline'])

      // Determine the model to use
      const modelToUse = selectedModel || 'openrouter/claude-3-5-sonnet'

      // Create config file
      const configFileCmd = `mkdir -p $HOME/.config/cline && cat > $HOME/.config/cline/config.json << 'EOF'
{
  "api_key": "${apiKey}",
  "provider": "${provider}",
  "default_model": "${modelToUse}"
}
EOF`
      const configFileResult = await runCommandInSandbox(sandbox, 'sh', ['-c', configFileCmd])

      if (configFileResult.success) {
        await logger.info('Cline CLI config file created successfully')
      } else {
        await logger.info('Warning: Failed to create Cline CLI config file')
      }

      // Verify authentication
      const verifyAuth = await runCommandInSandbox(sandbox, 'sh', [
        '-c',
        `cline --version`,
      ])
      if (verifyAuth.success) {
        await logger.info('Cline CLI authentication verified')
      } else {
        await logger.info('Warning: Cline CLI authentication could not be verified')
      }
    } else {
      await logger.info('Warning: No API key found, Cline CLI may not work')
    }

    return { success: true }
  } else {
    await logger.info('Failed to install Cline CLI')
    return { success: false }
  }
}

export async function executeClineInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[],
  isResumed?: boolean,
  sessionId?: string,
  taskId?: string,
  agentMessageId?: string,
): Promise<AgentExecutionResult> {
  let extractedSessionId: string | undefined
  try {
    // Check if Cline CLI is available
    const cliCheck = await runAndLogCommand(sandbox, 'which', ['cline'], logger)

    if (cliCheck.success) {
      await runAndLogCommand(sandbox, 'cline', ['--version'], logger)
    }

    if (!cliCheck.success) {
      const installResult = await installClineCLI(sandbox, logger, selectedModel, mcpServers)

      if (!installResult.success) {
        return {
          success: false,
          error: 'Failed to install Cline CLI',
          cliName: 'cline',
          changesDetected: false,
        }
      }

      const verifyCheck = await runAndLogCommand(sandbox, 'which', ['cline'], logger)
      if (!verifyCheck.success) {
        return {
          success: false,
          error: 'Cline CLI installation completed but CLI still not found',
          cliName: 'cline',
          changesDetected: false,
        }
      }
    }

    // Check for API key
    const hasApiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
    if (!hasApiKey) {
      return {
        success: false,
        error: 'OpenRouter, Anthropic, or OpenAI API key is required for Cline',
        cliName: 'cline',
        changesDetected: false,
      }
    }

    // Log what we're trying to do
    const modelToUse = selectedModel || 'openrouter/claude-3-5-sonnet'
    await logger.info(
      `Attempting to execute Cline with model ${modelToUse} and instruction: ${instruction.substring(0, 100)}...`,
    )

    // Create initial empty agent message in database if streaming
    if (taskId && agentMessageId) {
      await db.insert(taskMessages).values({
        id: agentMessageId,
        taskId,
        role: 'agent',
        content: '',
        createdAt: new Date(),
      })
    }

    // Build command
    let fullCommand = `cline --model "${modelToUse}" --dangerously-skip-permissions --output-format stream-json --verbose`

    // Add --resume flag for follow-up messages
    if (isResumed && sessionId) {
      fullCommand += ` --resume "${sessionId}"`
      await logger.info('Resuming Cline session')
    }

    fullCommand += ` "${instruction}"`

    await logger.info('Executing Cline CLI with --dangerously-skip-permissions for automated file changes...')

    // Set up environment
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
    const envCommand = `OPENROUTER_API_KEY="${apiKey}" ${fullCommand}`

    // Log the command we're about to execute
    const redactedCommand = envCommand.replace(apiKey!, '[REDACTED]')
    await logger.command(redactedCommand)

    // Set up streaming output capture
    let capturedOutput = ''
    let accumulatedContent = ''
    let isCompleted = false

    const captureStdout = new Writable({
      write(chunk, _encoding, callback) {
        const text = chunk.toString()

        if (!agentMessageId || !taskId) {
          capturedOutput += text
        }

        // Parse streaming JSON if we have a message to update
        if (agentMessageId && taskId) {
          const lines = text.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('//')) continue

            try {
              const parsed = JSON.parse(trimmed)

              // Handle assistant messages with content
              if (parsed.type === 'assistant' && parsed.message?.content) {
                for (const contentBlock of parsed.message.content) {
                  if (contentBlock.type === 'text' && contentBlock.text) {
                    accumulatedContent += contentBlock.text

                    db.update(taskMessages)
                      .set({
                        content: accumulatedContent,
                      })
                      .where(eq(taskMessages.id, agentMessageId))
                      .then(() => {})
                      .catch((err) => console.error('Failed to update message:', err))
                  }
                }
              }

              // Extract session ID and mark as completed
              else if (parsed.type === 'result') {
                if (parsed.session_id) {
                  extractedSessionId = parsed.session_id
                }
                isCompleted = true
              }
            } catch {
              // Not JSON, ignore
            }
          }
        }

        callback()
      },
    })

    const captureStderr = new Writable({
      write(chunk, _encoding, callback) {
        callback()
      },
    })

    // Execute Cline CLI with streaming
    await sandbox.runCommand({
      cmd: 'sh',
      args: ['-c', envCommand],
      sudo: false,
      detached: true,
      cwd: PROJECT_DIR,
      stdout: captureStdout,
      stderr: captureStderr,
    })

    await logger.info('Cline command started with output capture, monitoring for completion...')

    // Wait for completion
    while (!isCompleted) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    await logger.info('Cline completed successfully')

    // Check if any files were modified
    const gitStatusCheck = await runAndLogCommand(sandbox, 'git', ['status', '--porcelain'], logger)
    const hasChanges = gitStatusCheck.success && gitStatusCheck.output?.trim()

    if (!hasChanges) {
      await logger.info('No changes detected. Checking if files exist...')
      await runAndLogCommand(sandbox, 'find', ['.', '-name', 'README*', '-o', '-name', 'readme*'], logger)
      await runAndLogCommand(sandbox, 'ls', ['-la'], logger)
    }

    console.log('Cline execution completed, returning sessionId:', extractedSessionId)

    return {
      success: true,
      output: `Cline executed successfully${hasChanges ? ' (Changes detected)' : ' (No changes made)'}`,
      agentResponse: agentMessageId ? undefined : capturedOutput || 'No detailed response available',
      cliName: 'cline',
      changesDetected: !!hasChanges,
      error: undefined,
      sessionId: extractedSessionId,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute Cline in sandbox'
    return {
      success: false,
      error: errorMessage,
      cliName: 'cline',
      changesDetected: false,
    }
  }
}
