import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { redirectToSignIn } from '@/lib/session/redirect-to-sign-in'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    redirectToSignIn()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // For now, return mock templates - in a real app, these would be stored in the database
    const templates = [
      {
        id: '1',
        name: 'Bug Fix Template',
        description: 'Common template for fixing bugs and issues',
        prompt: 'Please analyze the code and fix the following bug: [BUG_DESCRIPTION]. Focus on identifying the root cause and implement a clean solution.',
        agent: 'claude',
        model: 'claude-sonnet-4-5-20250929',
        installDependencies: false,
        maxDuration: 180,
        keepAlive: false,
        category: 'Bug Fixes',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Feature Implementation',
        description: 'Template for implementing new features',
        prompt: 'Implement the following feature: [FEATURE_DESCRIPTION]. Please follow best practices, write clean code, and include proper documentation.',
        agent: 'claude',
        model: 'claude-sonnet-4-5-20250929',
        installDependencies: true,
        maxDuration: 300,
        keepAlive: true,
        category: 'Features',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Code Review',
        description: 'Template for code review and optimization',
        prompt: 'Please review the following code for: 1) Code quality and best practices 2) Security vulnerabilities 3) Performance issues 4) Readability and maintainability. Provide specific recommendations.',
        agent: 'claude',
        model: 'claude-opus-4-1-20250805',
        installDependencies: false,
        maxDuration: 240,
        keepAlive: false,
        category: 'Reviews',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Documentation Update',
        description: 'Template for updating documentation',
        prompt: 'Update the documentation to reflect the following changes: [CHANGES]. Ensure the documentation is clear, accurate, and follows the project\'s documentation standards.',
        agent: 'claude',
        model: 'claude-haiku-4-5-20251001',
        installDependencies: false,
        maxDuration: 120,
        keepAlive: false,
        category: 'Documentation',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Refactoring',
        description: 'Template for code refactoring',
        prompt: 'Refactor the code to improve: 1) Code structure and organization 2) Performance 3) Readability 4) Maintainability. Keep the same functionality but make it better.',
        agent: 'claude',
        model: 'claude-sonnet-4-5-20250929',
        installDependencies: false,
        maxDuration: 300,
        keepAlive: true,
        category: 'Refactoring',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    redirectToSignIn()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, prompt, agent, model, installDependencies, maxDuration, keepAlive, category, isPublic } = body

    if (!name || !prompt) {
      return NextResponse.json({ error: 'Name and prompt are required' }, { status: 400 })
    }

    // In a real app, you would save this to the database
    const newTemplate = {
      id: Date.now().toString(),
      name,
      description: description || '',
      prompt,
      agent: agent || 'claude',
      model: model || 'claude-sonnet-4-5-20250929',
      installDependencies: installDependencies || false,
      maxDuration: maxDuration || 300,
      keepAlive: keepAlive || false,
      category: category || 'Custom',
      isPublic: isPublic || false,
      userId: session.user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ template: newTemplate }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
