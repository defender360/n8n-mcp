# MCP Server for n8n (Simplified Version)

This is a simplified MCP server that connects to your existing n8n instance via API.

## Prerequisites

- An existing n8n instance running somewhere (locally, cloud, etc.)
- n8n API enabled and API key generated
- Railway account for deployment

## How it Works

```
Claude Desktop → MCP Server (Railway) → n8n API → Your Workflows
```

The MCP server acts as a bridge between Claude and your n8n workflows.

## Quick Setup

### 1. Configure n8n (on your existing instance)

1. Enable API: Settings → API → Enable API
2. Generate API Key: Settings → API → Create API Key
3. Tag workflows with "mcp" that you want to expose

### 2. Deploy MCP Server to Railway

1. Go to Railway Dashboard
2. New Project → Deploy from GitHub
3. Select `defender360/n8n-mcp`
4. Railway will use the MCP server configuration

### 3. Set Environment Variables

In Railway, add these variables:

```
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-from-n8n
PORT=${{PORT}}
NODE_ENV=production
```

### 4. Configure Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sse-client",
        "https://your-mcp-server.railway.app"
      ]
    }
  }
}
```

## Available Tools

The MCP server provides these tools to Claude:

1. **listWorkflows** - Lists all workflows tagged with "mcp"
2. **executeWorkflow** - Executes a specific workflow by ID
3. **getWorkflowDetails** - Gets details about a workflow

## Usage Examples

In Claude Desktop, you can:
- "List my n8n workflows"
- "Execute workflow ID xyz with data {name: 'test'}"
- "Get details about workflow abc"

## Troubleshooting

### Cannot connect to n8n
- Verify N8N_API_URL is correct
- Check that API is enabled in n8n
- Ensure API key is valid

### Workflows not found
- Make sure workflows have the "mcp" tag
- Verify workflows are active

### Railway deployment fails
- Check logs in Railway dashboard
- Ensure all environment variables are set

## Security Notes

- Keep your API key secure
- Use HTTPS for all connections
- Consider IP whitelisting if possible
