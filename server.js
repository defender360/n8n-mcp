const express = require('express');
const axios = require('axios');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Configuration from environment variables
const N8N_API_URL = process.env.N8N_API_URL || 'https://your-n8n-instance.com';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const PORT = process.env.PORT || 3000;
const MODE = process.env.MCP_MODE || 'http'; // 'http' or 'stdio'

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

// Tools definition
const TOOLS = [
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
];

// Tool handlers
async function handleListWorkflows() {
  const workflows = await callN8nAPI('/workflows');
  const mcpWorkflows = workflows.data.filter(wf => 
    wf.tags && wf.tags.some(tag => tag.name === 'mcp')
  );
  
  return {
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
}

async function handleExecuteWorkflow(args) {
  const { workflowId, data = {} } = args;
  const result = await callN8nAPI(
    `/workflows/${workflowId}/execute`,
    'POST',
    data
  );
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

async function handleGetWorkflowDetails(args) {
  const { workflowId } = args;
  const workflow = await callN8nAPI(`/workflows/${workflowId}`);
  
  return {
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
}

// MCP Server for stdio mode (Claude Code)
class N8nMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'listWorkflows':
            return await handleListWorkflows();
          case 'executeWorkflow':
            return await handleExecuteWorkflow(args);
          case 'getWorkflowDetails':
            return await handleGetWorkflowDetails(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP server running on stdio');
  }
}

// Express app for HTTP mode (Claude Desktop)
const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// SSE endpoint for Claude Desktop
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

// RPC endpoint
app.post('/rpc', async (req, res) => {
  const { method, params, id } = req.body;

  try {
    let result;

    switch (method) {
      case 'tools/list':
        result = { tools: TOOLS };
        break;

      case 'tools/call':
        const { name, arguments: args } = params;
        
        switch (name) {
          case 'listWorkflows':
            result = await handleListWorkflows();
            break;
          case 'executeWorkflow':
            result = await handleExecuteWorkflow(args);
            break;
          case 'getWorkflowDetails':
            result = await handleGetWorkflowDetails(args);
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
    mode: MODE,
    n8n_configured: !!N8N_API_URL && N8N_API_URL !== 'https://your-n8n-instance.com'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'n8n MCP Server',
    mode: MODE,
    endpoints: {
      health: '/health',
      sse: '/sse',
      rpc: '/rpc'
    },
    claude_desktop_config: {
      mcpServers: {
        n8n: {
          command: 'npx',
          args: [
            '-y',
            '@modelcontextprotocol/server-sse-client',
            `${req.protocol}://${req.get('host')}/sse`
          ]
        }
      }
    }
  });
});

// Start appropriate server based on mode
if (MODE === 'stdio') {
  // Claude Code mode
  const mcpServer = new N8nMCPServer();
  mcpServer.run().catch(console.error);
} else {
  // Claude Desktop mode (HTTP)
  app.listen(PORT, () => {
    console.log(`n8n MCP server (HTTP mode) running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Configuration endpoint: http://localhost:${PORT}/`);
    if (!N8N_API_KEY || N8N_API_KEY === 'your-n8n-api-key-here') {
      console.warn('WARNING: N8N_API_KEY not configured!');
    }
  });
}
