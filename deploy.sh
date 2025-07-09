#!/bin/bash

# Railway Deployment Script for n8n-mcp

echo "🚀 Starting Railway deployment for n8n-mcp..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null
then
    echo "❌ Not logged in to Railway. Please run:"
    echo "railway login"
    exit 1
fi

# Initialize Railway project if not already done
if [ ! -f ".railway/config.json" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Link to Railway project
echo "🔗 Linking to Railway project..."
railway link

# Add PostgreSQL database
echo "💾 Adding PostgreSQL database..."
railway add --plugin postgresql

# Add Redis
echo "📦 Adding Redis..."
railway add --plugin redis

# Deploy
echo "🚀 Deploying to Railway..."
railway up

# Get deployment URL
echo "✅ Deployment complete!"
echo "🌐 Your app URL: $(railway open --url)"

echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables in Railway dashboard"
echo "2. Import the n8n workflow from the documentation"
echo "3. Configure MCP client with your webhook URL"
