# 🔐 Environment Variables Setup Guide

## Overview

This guide will help you obtain and configure all required environment variables for **Yousef Agent**.

---

## 📋 Required Environment Variables

### **1. Security Variables (Already Generated) ✅**

These are already generated and ready to use:

| Variable | Value | Where to Add |
|----------|-------|--------------|
| `JWE_SECRET` | `LMpQ/aDaV5+888/W4rc05qMJVyatG8U4zfBoOOsTA3pLKocAJrE0zffVzMPrb2J/XS4fFkCX5URBAw7VqhzhRw==` | Vercel Dashboard > Settings > Environment Variables |
| `ENCRYPTION_KEY` | `jGDulmXMpZk3hcCZL8SbVx/kRW9NxS9qVCWypvFdhLg=` | Vercel Dashboard > Settings > Environment Variables |
| `AUTH_SECRET` | `Q9h+yx9AMrSZs2w0GsPO81vDP7GBBJfaS3GLz+GhcSWAWaFUY4PQzBVx3X+lFNRG` | Vercel Dashboard > Settings > Environment Variables |
| `NEXTAUTH_SECRET` | `El04mFW8KNZP4HvzM/e4ssnUkWqVoKUx63T17jAu9EM4iIy0kiDdG6K1fb90JPbB` | Vercel Dashboard > Settings > Environment Variables |

---

### **2. Database (REQUIRED) 🗄️**

**Option A: Neon (Recommended)**
1. Go to [https://neon.tech/](https://neon.tech/)
2. Sign up for a free account
3. Click "Create a project"
4. Choose a name (e.g., "yousef-agent-db")
5. Select a region closest to your users
6. Wait for the database to be created
7. Go to the dashboard and click on your project
8. Copy the connection string from "Connection details"
   - It looks like: `postgresql://user:password@ep-xxx-yyy-zzz.us-east-1.aws.neon.tech/neondb?sslmode=require`

**Option B: Supabase**
1. Go to [https://supabase.com/](https://supabase.com/)
2. Sign up for a free account
3. Click "New project"
4. Choose an organization
5. Enter project name and database password
6. Click "Create new project"
7. Wait for setup to complete
8. Go to Settings > Database
9. Copy the "Connection string" (URI format)

**Set in Vercel:**
- **Name:** `POSTGRES_URL`
- **Value:** Your connection string from above
- **Environment:** Production, Preview, Development

---

### **3. GitHub OAuth (REQUIRED) 🔑**

1. **Go to GitHub:**
   - Visit [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
   - Sign in to your GitHub account

2. **Create OAuth App:**
   - Click "New OAuth App"
   - Fill in the form:
     - **Application name:** `Yousef Agent` (or your app name)
     - **Homepage URL:** `https://your-app-name.vercel.app` (your Vercel URL)
     - **Authorization callback URL:** `https://your-app-name.vercel.app/api/auth/callback/github`
   - Click "Register application"

3. **Get Credentials:**
   - Copy the **Client ID**
   - Click "Generate a new client secret"
   - Copy the **Client Secret**

4. **Set in Vercel:**
   - **Name:** `GITHUB_CLIENT_ID`
   - **Value:** Your Client ID
   - **Name:** `GITHUB_CLIENT_SECRET`
   - **Value:** Your Client Secret

---

### **4. Vercel OAuth (REQUIRED) 🔑**

1. **Go to Vercel:**
   - Visit [Vercel Account Settings](https://vercel.com/account/tokens)
   - Sign in to your Vercel account

2. **Create OAuth Application:**
   - Go to "OAuth Applications" tab
   - Click "Create Application"
   - Fill in:
     - **Name:** `Yousef Agent` (or your app name)
     - **Redirect URL:** `https://your-app-name.vercel.app/api/auth/callback/vercel`
   - Click "Create"

3. **Get Credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**

4. **Set in Vercel:**
   - **Name:** `VERCEL_CLIENT_ID`
   - **Value:** Your Client ID
   - **Name:** `VERCEL_CLIENT_SECRET`
   - **Value:** Your Client Secret

---

### **5. OpenRouter API (REQUIRED for AI Agents) 🤖**

1. **Sign up for OpenRouter:**
   - Go to [https://openrouter.ai/](https://openrouter.ai/)
   - Sign up for a free account
   - Verify your email

2. **Get API Key:**
   - Go to [OpenRouter Keys](https://openrouter.ai/keys)
   - Click "Create Key"
   - Name it "Yousef Agent"
   - Copy the key (starts with `sk-or-`)

3. **Add Payment Method (Required):**
   - Go to [Billing](https://openrouter.ai/keys)
   - Add a payment method
   - OpenRouter uses pay-per-request pricing (~$0.10-0.30 per request)

4. **Set in Vercel:**
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your API key

---

### **6. Production URL (REQUIRED) 🌐**

Set your production domain:

- **Name:** `NEXTAUTH_URL`
- **Value:** `https://your-app-name.vercel.app` (replace with your actual Vercel URL)

---

### **7. Optional: Vercel Sandbox (For Code Execution) 🏗️**

**If you want code execution features:**

1. **Sign up:**
   - Go to [Vercel Sandbox](https://vercel.com/products/sandbox)
   - Request access or sign up if available

2. **Get Credentials:**
   - Get your **Sandbox Token**
   - Get your **Team ID**
   - Get your **Project ID**

3. **Set in Vercel:**
   - **Name:** `SANDBOX_VERCEL_TOKEN`
   - **Name:** `SANDBOX_VERCEL_TEAM_ID`
   - **Name:** `SANDBOX_VERCEL_PROJECT_ID`

---

## 🚀 How to Add Variables in Vercel Dashboard

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Select Your Project:**
   - Click on "Yousef Agent" project

3. **Navigate to Environment Variables:**
   - Go to **Settings** tab
   - Click on **Environment Variables** in the sidebar

4. **Add Each Variable:**
   - Click **Add New** button
   - **Name:** Enter the variable name (e.g., `POSTGRES_URL`)
   - **Value:** Enter the value
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

5. **Repeat for all variables**

### Method 2: Using the Script

```bash
# Make the script executable
chmod +x scripts/add-env-vars.sh

# Run the interactive script
./scripts/add-env-vars.sh
```

### Method 3: Vercel CLI

```bash
# Login to Vercel
vercel login

# Add each variable
echo "your-value" | vercel env add VARIABLE_NAME production

# Example:
echo "postgresql://..." | vercel env add POSTGRES_URL production
```

---

## ✅ Variables Checklist

Copy this checklist and check off as you add each variable:

### Security (Already Generated)
- [ ] JWE_SECRET
- [ ] ENCRYPTION_KEY
- [ ] AUTH_SECRET
- [ ] NEXTAUTH_SECRET

### Database
- [ ] POSTGRES_URL

### OAuth
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET
- [ ] VERCEL_CLIENT_ID
- [ ] VERCEL_CLIENT_SECRET

### AI
- [ ] OPENROUTER_API_KEY

### Configuration
- [ ] NEXTAUTH_URL

### Optional
- [ ] SANDBOX_VERCEL_TOKEN
- [ ] SANDBOX_VERCEL_TEAM_ID
- [ ] SANDBOX_VERCEL_PROJECT_ID

---

## 🎯 Next Steps

After adding all environment variables:

1. **Redeploy the application:**
   - Go to Vercel Dashboard > Deployments
   - Click "Redeploy" on the latest deployment

2. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Test the application:**
   - Visit your deployed URL
   - Try signing in with GitHub or Vercel
   - Create a test task
   - Check the analytics dashboard

---

## 🆘 Troubleshooting

### "Environment variable not found" error
- Make sure you've saved the variable in Vercel dashboard
- Check that the variable name is exactly correct (case-sensitive)
- Redeploy after adding variables

### "Database connection failed"
- Verify POSTGRES_URL is correct
- Check that your database allows connections from Vercel
- Ensure your database has the required tables (run migrations)

### "Authentication not working"
- Verify GitHub/Vercel OAuth callback URLs match exactly
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure NEXTAUTH_URL is set to your production URL

### "AI agents not working"
- Verify OPENROUTER_API_KEY is valid
- Check that your OpenRouter account has credits
- Review function logs for errors

---

## 📞 Need Help?

- **GitHub Repository:** [https://github.com/you112ef/Yousef-agent](https://github.com/you112ef/Yousef-agent)
- **Deployment Guide:** `./DEPLOYMENT.md`
- **Issues:** [GitHub Issues](https://github.com/you112ef/Yousef-agent/issues)

---

**✨ Follow this guide and you'll have all environment variables configured!**
