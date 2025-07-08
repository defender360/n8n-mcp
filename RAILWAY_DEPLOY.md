# Railway Deployment Guide for n8n-mcp

This guide will help you deploy the n8n MCP server to Railway.

## Prerequisites

- [Railway Account](https://railway.app)
- GitHub account connected to Railway

## Quick Deploy

### Step 1: Deploy to Railway

1. Go to your Railway dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `defender360/n8n-mcp`
4. Railway will automatically detect the configuration

### Step 2: Add Required Services

In your Railway project:

1. **PostgreSQL Database**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically configure connection variables

2. **Redis**:
   - Click "New" → "Database" → "Add Redis"  
   - Railway will automatically configure connection variables

### Step 3: Configure Environment Variables

Copy ALL variables from `.env.railway` file to Railway:

1. Go to your service → "Variables" tab
2. Click "Raw Editor"
3. Copy and paste all variables from `.env.railway`
4. **IMPORTANT**: Update these values:
   - `N8N_BASIC_AUTH_PASSWORD` - Change to a secure password
   - `N8N_ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`

### Step 4: Deploy and Access

1. Railway will automatically redeploy after adding variables
2. Wait for the build to complete (check logs)
3. Get your URL from Railway dashboard (top right)
4. Access n8n at: `https://your-app.railway.app`
5. Login with your configured credentials

## Setting up MCP Server

After n8n is running:

### 1. Create API Key
- Go to Settings → API → Generate API Key
- Save this key securely

### 2. Import MCP Workflow
- Import the workflow from the n8n.md documentation
- The workflow will create MCP server endpoints

### 3. Configure Your Workflows
- Tag workflows you want to expose with "mcp"
- Ensure they have "Execute Workflow Trigger" nodes
- Define input schema in the trigger nodes

### 4. Get MCP Server URL
- Open the imported MCP workflow
- Find the webhook URL (e.g., `https://your-app.railway.app/webhook/xxx`)
- This is your MCP server endpoint

### 5. Configure Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-workflows": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sse-client",
        "https://your-app.railway.app/webhook/your-webhook-id"
      ]
    }
  }
}
```

## Troubleshooting

### n8n shows "localhost:5678"
- Check that all environment variables are set correctly
- Ensure `N8N_HOST=0.0.0.0` is configured
- Railway should provide `PORT` automatically

### Database Connection Errors
- Verify PostgreSQL service is added
- Check that database variables use Railway's template syntax: `${{PGDATABASE}}`

### Cannot Access n8n Externally
- Verify your Railway service has a domain assigned
- Check logs for binding errors
- Ensure `WEBHOOK_URL` and `N8N_EDITOR_BASE_URL` use `https://${{RAILWAY_PUBLIC_DOMAIN}}`

### MCP Connection Issues
- Verify n8n API is enabled: `N8N_API_ENABLED=true`
- Check that workflows have the "mcp" tag
- Ensure API key is valid and has correct permissions

## Security Notes

1. Always use HTTPS in production
2. Set strong passwords for `N8N_BASIC_AUTH_PASSWORD`
3. Generate a unique `N8N_ENCRYPTION_KEY`
4. Consider IP whitelisting if needed
5. Regularly update n8n to the latest version

## Support

For deployment issues, check:
- Railway logs for build/runtime errors
- n8n logs for application errors
- This repository's issues section
