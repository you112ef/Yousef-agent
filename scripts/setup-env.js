#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function generateSecret(length = 48) {
  return crypto.randomBytes(length).toString('base64');
}

function generateShortSecret(length = 24) {
  return crypto.randomBytes(length).toString('base64');
}

async function main() {
  log('\n🚀 Yousef Agent - Environment Setup\n', colors.cyan + colors.bright);

  log('This script will help you generate the required environment variables.', colors.blue);
  log('Make sure you have OpenSSL installed on your system.\n', colors.yellow);

  // Generate secrets
  log('Generating security secrets...', colors.bright);
  const jweSecret = generateSecret(64);
  const encryptionKey = generateShortSecret(32);
  const authSecret = generateSecret(48);
  const nextAuthSecret = generateSecret(48);

  log('✅ Security secrets generated!\n', colors.green);

  // Create .env.local content
  const envContent = `# Yousef Agent - Local Environment Variables
# Generated on ${new Date().toISOString()}

# =============================================================================
# ESSENTIAL SECURITY VARIABLES (GENERATED)
# =============================================================================
JWE_SECRET=${jweSecret}
ENCRYPTION_KEY=${encryptionKey}
AUTH_SECRET=${authSecret}
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# DATABASE (REQUIRED - You need to set this)
# =============================================================================
# Get from: https://neon.tech/ or https://supabase.com/
# Example: postgresql://user:password@host:port/database
POSTGRES_URL=your-postgres-url-here

# =============================================================================
# OAUTH AUTHENTICATION (REQUIRED - Choose at least one)
# =============================================================================

# GitHub OAuth (Recommended)
# Get from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Vercel OAuth
# Get from: https://vercel.com/account/tokens
VERCEL_CLIENT_ID=your-vercel-client-id
VERCEL_CLIENT_SECRET=your-vercel-client-secret

# =============================================================================
# AI API KEYS (RECOMMENDED - For AI agents to work)
# =============================================================================

# OpenRouter (Required for Cline and Kilo agents)
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-your-openrouter-key-here

# Other AI providers (Optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
CURSOR_API_KEY=your-cursor-key-here

# =============================================================================
# VERCEL SANDBOX (OPTIONAL - For code execution)
# =============================================================================
# Get from: https://vercel.com/products/sandbox
SANDBOX_VERCEL_TOKEN=your-sandbox-token
SANDBOX_VERCEL_TEAM_ID=your-sandbox-team-id
SANDBOX_VERCEL_PROJECT_ID=your-sandbox-project-id

# =============================================================================
# VERCEL CONFIGURATION (Auto-set by Vercel)
# =============================================================================
NODE_ENV=development
VERCEL=1
`;

  // Write to file
  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);

  log(`✅ Created .env.local file`, colors.green);
  log(`📍 Location: ${envPath}\n`, colors.cyan);

  // Display the secrets
  log('🔐 Generated Secrets (save these safely!):', colors.bright);
  log('=' .repeat(70), colors.magenta);
  log(`JWE_SECRET=${jweSecret}`, colors.yellow);
  log(`ENCRYPTION_KEY=${encryptionKey}`, colors.yellow);
  log(`AUTH_SECRET=${authSecret}`, colors.yellow);
  log(`NEXTAUTH_SECRET=${nextAuthSecret}`, colors.yellow);
  log('=' .repeat(70), colors.magenta);
  log('', colors.reset);

  // Next steps
  log('📋 Next Steps:', colors.bright + colors.green);
  log('1. Edit .env.local and fill in the following:', colors.blue);
  log('   - POSTGRES_URL (from Neon/Supabase)', colors.cyan);
  log('   - GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET (from GitHub)', colors.cyan);
  log('   - VERCEL_CLIENT_ID & VERCEL_CLIENT_SECRET (from Vercel)', colors.cyan);
  log('   - OPENROUTER_API_KEY (from OpenRouter)', colors.cyan);
  log('', colors.reset);

  log('2. Set up your database:', colors.blue);
  log('   npm run db:generate', colors.cyan);
  log('   npm run db:migrate', colors.cyan);
  log('', colors.reset);

  log('3. Start development server:', colors.blue);
  log('   npm run dev', colors.cyan);
  log('', colors.reset);

  log('4. For production deployment to Vercel:', colors.blue);
  log('   - Copy the secrets from .env.local to Vercel Environment Variables');
  log('   - Or use: vercel env pull', colors.cyan);
  log('   - Then deploy: vercel --prod', colors.cyan);
  log('', colors.reset);

  // Create a .env.production.local template
  const prodEnvPath = path.join(process.cwd(), '.env.production.local');
  const prodEnvContent = envContent.replace('NEXTAUTH_URL=http://localhost:3000', 'NEXTAUTH_URL=https://your-vercel-app.vercel.app');
  prodEnvContent.replace('NODE_ENV=development', 'NODE_ENV=production');
  fs.writeFileSync(prodEnvPath, prodEnvContent);

  log('✅ Also created .env.production.local template for production', colors.green);
  log(`📍 Location: ${prodEnvPath}\n`, colors.cyan);

  // Links
  log('🔗 Helpful Links:', colors.bright);
  log('• GitHub OAuth: https://github.com/settings/developers', colors.cyan);
  log('• Vercel OAuth: https://vercel.com/account/tokens', colors.cyan);
  log('• OpenRouter: https://openrouter.ai/keys', colors.cyan);
  log('• Neon DB: https://neon.tech/', colors.cyan);
  log('• Supabase: https://supabase.com/', colors.cyan);
  log('• Vercel Sandbox: https://vercel.com/products/sandbox', colors.cyan);
  log('• Full Deployment Guide: ./DEPLOYMENT.md', colors.cyan);
  log('', colors.reset);

  log('✨ Setup complete! Check .env.local file to continue configuration.', colors.green + colors.bright);
  log('', colors.reset);
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
