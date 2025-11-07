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
    echo -e "\n${CYAN}🚀 $1${NC}\n"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    print_info "Please run 'npm run setup' first to generate environment variables."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed!"
    print_info "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
print_header "Checking Vercel authentication"
if ! vercel whoami &> /dev/null; then
    print_info "Please log in to Vercel..."
    vercel login
fi

VERCEL_USER=$(vercel whoami 2>/dev/null)
print_success "Logged in as: $VERCEL_USER"

# Build the application
print_header "Building the application"
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi
print_success "Build successful!"

# Deploy to Vercel
print_header "Deploying to Vercel"
vercel --prod

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_success "Deployment successful!"

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls 2>/dev/null | grep -m 1 "https://" | awk '{print $1}')
if [ -n "$DEPLOYMENT_URL" ]; then
    print_info "Your app is deployed at: $DEPLOYMENT_URL"
fi

# Set environment variables reminder
print_header "Environment Variables Setup"
print_warning "Don't forget to set your environment variables in Vercel dashboard!"
print_info ""
print_info "Required variables to set in Vercel Dashboard > Settings > Environment Variables:"
print_info "  1. POSTGRES_URL (from Neon/Supabase)"
print_info "  2. GITHUB_CLIENT_ID (from GitHub OAuth)"
print_info "  3. GITHUB_CLIENT_SECRET (from GitHub OAuth)"
print_info "  4. VERCEL_CLIENT_ID (from Vercel OAuth)"
print_info "  5. VERCEL_CLIENT_SECRET (from Vercel OAuth)"
print_info "  6. OPENROUTER_API_KEY (from OpenRouter)"
print_info ""
print_info "You can also copy all variables from .env.local:"
print_info "  vercel env pull .env.production.local"
print_info ""

# Next steps
print_header "Next Steps"
print_info "1. Set up your database:"
print_info "   npm run db:generate"
print_info "   npm run db:migrate"
print_info ""
print_info "2. Test your deployment by visiting the URL"
print_info ""
print_info "3. Check the analytics dashboard"
print_info ""

print_success "Deployment complete! 🎉"
