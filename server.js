const express = require('express');
const axios = require('axios');

// Configuration from environment variables
const N8N_API_URL = process.env.N8N_API_URL || 'https://your-n8n-instance.com';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const PORT = process.env.PORT || 3000;

// Express app
const app = express();
app.use(express.json());

// Enable CORS for SSE
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Helper function to call n8n API
async function callN8nAPI(endpoint, method = 'GET', data = null) {
  try {
    const response = await axios({
      method,
      url: `${N8N_API_URL}/api/v1${endpoint}`,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error('n8n API error:', error.message);
    throw error;
  }
}

// MCP SSE endpoint
app.get('/sse', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial connection message
  res.write('data: {"jsonrpc":"2.0","result":{"protocolVersion":"1.0.0","serverInfo":{"name":"n8n-mcp-server","version":"1.0.0"},"capabilities":{"tools":{"list":true}}}}\n\n');

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// MCP RPC endpoint
app.post('/rpc', async (req, res) => {
  const { method, params, id } = req.body;

  try {
    let result;

    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            {
              name: 'listWorkflows',
              description: 'List all available n8n workflows tagged with "mcp"',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'executeWorkflow',
              description: 'Execute a specific n8n workflow',
              inputSchema: {
                type: 'object',
                properties: {
                  workflowId: {
                    type: 'string',
                    description: 'The ID of the workflow to execute',
                  },
                  data: {
                    type: 'object',
                    description: 'Input data for the workflow',
                  },
                },
                required: ['workflowId'],
              },
            },
            {
              name: 'getWorkflowDetails',
              description: 'Get details about a specific workflow',
              inputSchema: {
                type: 'object',
                properties: {
                  workflowId: {
                    type: 'string',
                    description: 'The ID of the workflow',
                  },
                },
                required: ['workflowId'],
              },
            },
          ],
        };
        break;

      case 'tools/call':
        const { name, arguments: args } = params;
        
        switch (name) {
          case 'listWorkflows':
            const workflows = await callN8nAPI('/workflows');
            const mcpWorkflows = workflows.data.filter(wf => 
              wf.tags && wf.tags.some(tag => tag.name === 'mcp')
            );
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(mcpWorkflows.map(wf => ({
                    id: wf.id,
                    name: wf.name,
                    active: wf.active,
                  })), null, 2),
                },
              ],
            };
            break;

          case 'executeWorkflow':
            const { workflowId, data = {} } = args;
            const execResult = await callN8nAPI(
              `/workflows/${workflowId}/execute`,
              'POST',
              data
            );
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(execResult, null, 2),
                },
              ],
            };
            break;

          case 'getWorkflowDetails':
            const workflow = await callN8nAPI(`/workflows/${args.workflowId}`);
            result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    active: workflow.active,
                    nodeCount: workflow.nodes.length,
                  }, null, 2),
                },
              ],
            };
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    res.json({ jsonrpc: '2.0', result, id });
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error.message,
      },
      id,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'n8n-mcp-server',
    version: '1.0.0',
    n8n_configured: !!N8N_API_URL && N8N_API_URL !== 'https://your-n8n-instance.com'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'n8n MCP Server',
    endpoints: {
      health: '/health',
      sse: '/sse',
      rpc: '/rpc'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`n8n MCP server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (!N8N_API_KEY || N8N_API_KEY === 'your-n8n-api-key-here') {
    console.warn('WARNING: N8N_API_KEY not configured!');
  }
});
