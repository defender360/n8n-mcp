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

// Express app for SSE endpoint
const app = express();
app.use(express.json());

// Available tools
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

// MCP Server setup
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'listWorkflows':
          return await this.listWorkflows();
        
        case 'executeWorkflow':
          return await this.executeWorkflow(args);
        
        case 'getWorkflowDetails':
          return await this.getWorkflowDetails(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async listWorkflows() {
    try {
      const workflows = await callN8nAPI('/workflows');
      // Filter workflows with 'mcp' tag
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
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing workflows: ${error.message}`,
          },
        ],
      };
    }
  }

  async executeWorkflow(args) {
    try {
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
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing workflow: ${error.message}`,
          },
        ],
      };
    }
  }

  async getWorkflowDetails(args) {
    try {
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
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting workflow details: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP server running on stdio');
  }
}

// SSE endpoint for web clients
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'n8n-mcp-server' });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Start MCP server if run directly
if (require.main === module) {
  const mcpServer = new N8nMCPServer();
  mcpServer.run().catch(console.error);
}

module.exports = { N8nMCPServer };
