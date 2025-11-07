#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${CYAN}🔧 $1${NC}\n"
}

print_step() {
    echo -e "\n${YELLOW}➜ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed!"
    print_info "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    print_info "Please log in to Vercel..."
    vercel login
fi

print_header "Adding Environment Variables to Vercel"

# List of required environment variables
print_info "This script will add all required environment variables to your Vercel project."
print_info "You'll need to provide the actual values for each variable.\n"

# Function to add an environment variable
add_var() {
    local var_name=$1
    local description=$2
    local required=$3

    print_step "Setting up $var_name"
    print_info "$description"

    if [ "$required" = "true" ]; then
        echo -n "Enter value for $var_name (required): "
    else
        echo -n "Enter value for $var_name (optional, press Enter to skip): "
    fi
    read -r value

    if [ -n "$value" ]; then
        echo "$value" | vercel env add "$var_name" production
        print_success "Added $var_name"
    else
        if [ "$required" = "true" ]; then
            print_warning "Skipped $var_name (but it's required!)"
        else
            print_info "Skipped $var_name"
        fi
    fi
}

# Essential Security Variables (already generated)
print_header "1. ESSENTIAL SECURITY VARIABLES"
print_info "These are already generated in .env.local"
print_info "We'll use the generated values:\n"

echo "JWE_SECRET already generated"
echo "ENCRYPTION_KEY already generated"
echo "AUTH_SECRET already generated"
echo "NEXTAUTH_SECRET already generated"
echo "NEXTAUTH_SECRET will be set to your production URL"

# Database
print_header "2. DATABASE CONFIGURATION"
add_var "POSTGRES_URL" "Get from: https://neon.tech/ or https://supabase.com/
Example: postgresql://user:password@host:port/database" "true"

# OAuth Authentication
print_header "3. OAUTH AUTHENTICATION"
add_var "GITHUB_CLIENT_ID" "Get from: https://github.com/settings/developers
Create an OAuth App and get the Client ID" "true"

add_var "GITHUB_CLIENT_SECRET" "Get from: https://github.com/settings/developers
Create an OAuth App and get the Client Secret" "true"

add_var "VERCEL_CLIENT_ID" "Get from: https://vercel.com/account/tokens
Create an OAuth application" "true"

add_var "VERCEL_CLIENT_SECRET" "Get from: https://vercel.com/account/tokens
Create an OAuth application" "true"

# AI API Keys
print_header "4. AI API KEYS"
add_var "OPENROUTER_API_KEY" "Get from: https://openrouter.ai/keys
Required for Cline and Kilo agents" "true"

add_var "ANTHROPIC_API_KEY" "Optional: For Claude agent
Get from: https://console.anthropic.com/" "false"

add_var "OPENAI_API_KEY" "Optional: For Codex and OpenCode agents
Get from: https://platform.openai.com/api-keys" "false"

add_var "GEMINI_API_KEY" "Optional: For Gemini agent
Get from: https://makersuite.google.com/app/apikey" "false"

# Vercel Sandbox (Optional)
print_header "5. VERCEL SANDBOX (OPTIONAL)"
add_var "SANDBOX_VERCEL_TOKEN" "Get from: https://vercel.com/products/sandbox
For code execution features" "false"

add_var "SANDBOX_VERCEL_TEAM_ID" "Get from Vercel Sandbox dashboard" "false"

add_var "SANDBOX_VERCEL_PROJECT_ID" "Get from Vercel Sandbox dashboard" "false"

# NEXTAUTH_URL (production)
print_step "Setting NEXTAUTH_URL"
echo "Enter your production domain (e.g., https://yoursef-agent.vercel.app): "
read -r production_url

if [ -n "$production_url" ]; then
    echo "$production_url" | vercel env add NEXTAUTH_URL production
    print_success "Added NEXTAUTH_URL"
else
    print_warning "Skipped NEXTAUTH_URL"
fi

# Summary
print_header "ENVIRONMENT VARIABLES SUMMARY"
print_info "Environment variables added to Vercel!"
print_info ""
print_info "Next steps:"
print_info "1. Redeploy your application in Vercel dashboard"
print_info "2. Run database migrations:"
print_info "   npm run db:generate"
print_info "   npm run db:migrate"
print_info ""
print_success "Environment setup complete! 🎉"
