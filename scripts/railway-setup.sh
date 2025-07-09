#!/bin/bash

# n8n-MCP Railway Setup Script
# This script helps set up the project for Railway deployment

set -e

echo "🚂 n8n-MCP Railway Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
    else
        echo -e "${GREEN}✓ Railway CLI is installed${NC}"
    fi
}

# Generate secure token
generate_token() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        # Fallback to node.js crypto
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    fi
}

# Check if repository is ready
check_repo() {
    echo -e "\n${YELLOW}Checking repository status...${NC}"
    
    # Check if nodes.db exists
    if [ -f "data/nodes.db" ]; then
        echo -e "${GREEN}✓ Database file exists${NC}"
    else
        echo -e "${RED}✗ Database file missing. Run 'npm run rebuild' first${NC}"
        exit 1
    fi
    
    # Check if Dockerfile exists
    if [ -f "Dockerfile" ]; then
        echo -e "${GREEN}✓ Dockerfile exists${NC}"
    else
        echo -e "${RED}✗ Dockerfile missing${NC}"
        exit 1
    fi
    
    # Check if railway.toml exists
    if [ -f "railway.toml" ]; then
        echo -e "${GREEN}✓ railway.toml exists${NC}"
    else
        echo -e "${RED}✗ railway.toml missing${NC}"
        exit 1
    fi
}

# Create environment variables file
create_env_file() {
    echo -e "\n${YELLOW}Creating Railway environment template...${NC}"
    
    AUTH_TOKEN=$(generate_token)
    
    cat > .env.railway.example << EOF
# n8n-MCP Railway Environment Variables
# Copy these to Railway Dashboard > Variables

# Required
MCP_MODE=http
AUTH_TOKEN=$AUTH_TOKEN
USE_FIXED_HTTP=true
PORT=3000
HOST=0.0.0.0
TRUST_PROXY=1

# Production settings
NODE_ENV=production
LOG_LEVEL=info
NODE_DB_PATH=/app/data/nodes.db
REBUILD_ON_START=false
DISABLE_CONSOLE_OUTPUT=true

# Optional: n8n API (uncomment and configure)
# N8N_API_URL=https://your-n8n-instance.com
# N8N_API_KEY=your-api-key-here
EOF

    echo -e "${GREEN}✓ Created .env.railway.example${NC}"
    echo -e "${YELLOW}  Generated AUTH_TOKEN: $AUTH_TOKEN${NC}"
    echo -e "${YELLOW}  Save this token securely!${NC}"
}

# Initialize Railway project
init_railway() {
    echo -e "\n${YELLOW}Initializing Railway project...${NC}"
    
    if [ -d ".railway" ]; then
        echo -e "${GREEN}✓ Railway project already initialized${NC}"
    else
        echo -e "${YELLOW}Running 'railway init'...${NC}"
        railway init
    fi
}

# Deploy to Railway
deploy_railway() {
    echo -e "\n${YELLOW}Ready to deploy to Railway${NC}"
    echo -e "Next steps:"
    echo -e "1. ${GREEN}railway login${NC} - Login to Railway"
    echo -e "2. ${GREEN}railway up${NC} - Deploy the project"
    echo -e "3. Go to Railway dashboard and add environment variables from .env.railway.example"
    echo -e "4. Your app will be available at the Railway-provided URL"
    
    echo -e "\n${YELLOW}Deploy now? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        railway login
        railway up
        echo -e "\n${GREEN}✓ Deployment initiated!${NC}"
        echo -e "Check your Railway dashboard for the deployment status and URL"
    else
        echo -e "\n${YELLOW}Deployment skipped. Run 'railway up' when ready.${NC}"
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}Starting Railway setup...${NC}"
    
    check_railway_cli
    check_repo
    create_env_file
    init_railway
    
    echo -e "\n${GREEN}✓ Setup complete!${NC}"
    echo -e "\n${YELLOW}Environment variables have been saved to .env.railway.example${NC}"
    echo -e "Copy these values to your Railway dashboard after deployment."
    
    deploy_railway
}

# Run main function
main