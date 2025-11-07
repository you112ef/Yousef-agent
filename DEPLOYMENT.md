# 🚀 Yousef Agent - Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/you112ef/Yousef-agent&project-name=yousef-agent&repository-name=yousef-agent)

## Required Environment Variables

Before deploying, you need to configure the following environment variables in Vercel:

### 1. 🔐 Essential Security Variables

Generate these secrets:
```bash
# Generate a random JWE secret (64 characters)
openssl rand -base64 48

# Generate a random encryption key (32 characters)
openssl rand -base64 24
```

Required values:
- **JWE_SECRET** = `your-jwe-secret-here-64-chars`
- **ENCRYPTION_KEY** = `your-encryption-key-here-32-chars`
- **AUTH_SECRET** = `your-auth-secret-here`
- **NEXTAUTH_SECRET** = `your-nextauth-secret-here`
- **NEXTAUTH_URL** = `https://your-domain.vercel.app` (or your custom domain)

### 2. 🗄️ Database (Required)

Set up a PostgreSQL database (Neon, Supabase, or Railway):

- **POSTGRES_URL** = `postgresql://user:password@host:port/database`

**Quick Setup Options:**
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - PostgreSQL with extras
- [Railway](https://railway.app/) - Simple PostgreSQL hosting

### 3. 🔑 OAuth Authentication (Choose at least one)

#### GitHub OAuth:
1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL to: `https://your-domain.vercel.app/api/auth/callback/github`
4. Get:
   - **GITHUB_CLIENT_ID** = `your-github-client-id`
   - **GITHUB_CLIENT_SECRET** = `your-github-client-secret`

#### Vercel OAuth:
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new OAuth application
3. Set callback URL to: `https://your-domain.vercel.app/api/auth/callback/vercel`
4. Get:
   - **VERCEL_CLIENT_ID** = `your-vercel-client-id`
   - **VERCEL_CLIENT_SECRET** = `your-vercel-client-secret`

### 4. 🤖 AI API Keys (Optional but Recommended)

#### OpenRouter (Required for Cline and Kilo agents):
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from [OpenRouter Keys](https://openrouter.ai/keys)
3. Set:
   - **OPENROUTER_API_KEY** = `sk-or-your-openrouter-key`

#### Other AI Providers (Optional):
- **ANTHROPIC_API_KEY** = `sk-ant-your-anthropic-key` (for Claude)
- **OPENAI_API_KEY** = `sk-your-openai-key` (for Codex, OpenCode)
- **GEMINI_API_KEY** = `your-gemini-key` (for Gemini)
- **CURSOR_API_KEY** = `your-cursor-key` (for Cursor)

### 5. 🔧 Vercel Sandbox (Optional)

Required only if you want code execution sandbox:

1. Sign up for [Vercel Sandbox](https://vercel.com/products/sandbox)
2. Get your credentials from the dashboard:
   - **SANDBOX_VERCEL_TOKEN** = `your-sandbox-token`
   - **SANDBOX_VERCEL_TEAM_ID** = `your-sandbox-team-id`
   - **SANDBOX_VERCEL_PROJECT_ID** = `your-sandbox-project-id`

## Vercel CLI Deployment

If you have the Vercel CLI installed:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add POSTGRES_URL
vercel env add JWE_SECRET
vercel env add ENCRYPTION_KEY
# ... add all other variables
```

## Environment Variables in Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings > Environment Variables**
3. Add each variable:
   - **Name**: The variable name (e.g., `POSTGRES_URL`)
   - **Value**: The actual value
   - **Environment**: Select `Production`, `Preview`, and `Development`
4. Click **Save**
5. Redeploy your application

## After Deployment

1. **Database Setup**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. **Test the Application**:
   - Visit your deployed URL
   - Try signing in with GitHub or Vercel
   - Create a new task
   - Check the analytics dashboard

## Troubleshooting

### Database Connection Issues
- Verify POSTGRES_URL is correct
- Ensure your database allows connections from Vercel
- Check Neon/Supabase dashboard for connection logs

### Authentication Not Working
- Verify OAuth callback URLs match exactly
- Check GitHub/Vercel OAuth app settings
- Ensure CLIENT_ID and CLIENT_SECRET are correct

### Build Failures
- Check all required environment variables are set
- Verify NODE_ENV is set to "production"
- Check build logs in Vercel dashboard

### AI Agents Not Working
- Verify API keys are valid and have credits
- Check API key permissions
- Review function logs for error details

## Support

For issues and questions:
- Check [GitHub Issues](https://github.com/you112ef/Yousef-agent/issues)
- Review the [Help Page](https://your-domain.vercel.app/help) after deployment
- Check Vercel function logs for errors

## Security Best Practices

✅ **DO:**
- Use strong, unique secrets for each environment
- Rotate API keys regularly
- Only grant necessary permissions to OAuth apps
- Use different databases for development and production
- Monitor your API usage and costs

❌ **DON'T:**
- Commit .env files to version control
- Share your API keys with others
- Use production keys in development
- Leave unnecessary environment variables set
- Ignore security warnings from Vercel

## Estimated Costs

- **Vercel**: Free tier (100GB bandwidth, 6GB storage)
- **Database (Neon)**: Free tier (500MB storage, 100 connections)
- **OpenRouter**: Pay-per-use (~$0.10-0.30 per request)
- **Vercel Sandbox**: Usage-based pricing

---

**🎉 You're all set!** Follow this guide and you'll have Yousef Agent running in production!
