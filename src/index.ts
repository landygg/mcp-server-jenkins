#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { JenkinsClient } from './client/jenkins.js';
import { JenkinsConfig } from './types/jenkins.js';
import { tools, executeTool } from './tools/index.js';

/**
 * MCP Server for Jenkins
 * Provides AI-powered interactions with Jenkins CI/CD
 */

// Read configuration from environment variables
// Note: JENKINS_TIMEOUT is in seconds and will be converted to milliseconds
const config: JenkinsConfig = {
  url: process.env.JENKINS_URL || '',
  username: process.env.JENKINS_USERNAME,
  password: process.env.JENKINS_PASSWORD || process.env.JENKINS_API_TOKEN,
  timeout: parseInt(process.env.JENKINS_TIMEOUT || '5'), // seconds
  verifySSL: process.env.JENKINS_VERIFY_SSL !== 'false',
};

// Validate configuration
if (!config.url) {
  console.error('Error: JENKINS_URL environment variable is required');
  process.exit(1);
}

// Create Jenkins client
let jenkinsClient: JenkinsClient;

try {
  jenkinsClient = new JenkinsClient(config);
} catch (error) {
  console.error('Error: Failed to initialize Jenkins client:', error);
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'jenkins-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(jenkinsClient, name, args || {});
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error for debugging
    console.error(`Error executing tool ${name}:`, errorMessage);
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to execute tool ${name}: ${errorMessage}`
    );
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  // Log to stderr (stdout is used for MCP protocol)
  console.error('Jenkins MCP Server started');
  console.error(`Connected to Jenkins: ${config.url}`);
  console.error(`Available tools: ${tools.length}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
