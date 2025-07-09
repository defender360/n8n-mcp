# Railway Deployment Guide for n8n-mcp

This guide will help you deploy the n8n MCP server to Railway.

## Prerequisites

- [Railway Account](https://railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- n8n workflows with "mcp" tag and Subworkflow triggers

## Quick Deploy

### Option 1: Deploy with Railway Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/defender360/n8n-mcp)

### Option 2: Manual Deploy

1. Clone this repository:
```bash
git clone https://github.com/defender360/n8n-mcp.git
cd n8n-mcp
```

2. Run the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Configuration

### 1. Set Environment Variables

In your Railway dashboard, set these variables:

```env
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=your_username
N8N_BASIC_AUTH_PASSWORD=your_secure_password
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-app.up.railway.app/
N8N_EDITOR_BASE_URL=https://your-app.up.railway.app/

# Encryption key (generate with: openssl rand -base64 32)
N8N_ENCRYPTION_KEY=your_generated_key_here

# MCP Configuration
MCP_SERVER_ENABLED=true
MCP_SERVER_PORT=3000

# n8n API
N8N_API_ENABLED=true
```

### 2. Configure n8n

1. Access your n8n instance at `https://your-app.up.railway.app`
2. Create an API key: Settings → API → Generate API Key
3. Import the MCP workflow from the documentation
4. Tag your workflows with "mcp" to expose them via MCP

### 3. Configure MCP Client

For Claude Desktop, create/edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-workflows": {
      "command": "node",
      "args": ["/path/to/mcp-client.js"],
      "env": {
        "MCP_SERVER_URL": "https://your-app.up.railway.app/webhook/your-webhook-id"
      }
    }
  }
}
```

## Workflow Requirements

For workflows to be accessible via MCP:

1. Add the tag "mcp" to the workflow
2. Include an "Execute Workflow Trigger" node
3. Define input schema in the trigger node

## Troubleshooting

- **Database Connection Error**: Railway automatically provisions PostgreSQL. Check that database variables are set.
- **Redis Connection Error**: Ensure Redis service is added and variables are configured.
- **Workflows Not Found**: Verify workflows have the "mcp" tag.
- **API Authentication Error**: Check that n8n API key is correctly configured.

## Support

For issues specific to this Railway deployment, please open an issue in this repository.
