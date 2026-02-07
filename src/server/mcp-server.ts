import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { JenkinsClient } from '../client/jenkins.js';
import { sanitizeUrl } from '../config/jenkins-config.js';
import { tools } from '../tools/definitions.js';
import type { JenkinsConfig } from '../types/jenkins.js';
import type { Logger } from '../utils/logger.js';
import { registerHandlers } from './handlers.js';

/**
 * Options for creating the MCP server.
 */
export interface McpServerOptions {
  name?: string;
  version?: string;
}

/**
 * Create an MCP server instance with default capabilities.
 * @param {McpServerOptions} [options] - Server metadata options.
 * @returns {McpServer} MCP server instance.
 */
export function createMcpServer(options: McpServerOptions = {}): McpServer {
  const { name = 'jenkins-mcp-server', version = '0.1.0' } = options;

  return new McpServer(
    { name, version },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

/**
 * Start the MCP server with stdio transport and registered handlers.
 * @param {object} params - Startup parameters.
 * @param {JenkinsConfig} params.config - Jenkins configuration.
 * @param {JenkinsClient} params.client - Jenkins API client.
 * @param {Logger} params.logger - Structured logger.
 * @param {McpServerOptions} [params.serverOptions] - MCP server options.
 * @returns {Promise<void>} Resolves when server is connected.
 */
export async function startMcpServer(params: {
  config: JenkinsConfig;
  client: JenkinsClient;
  logger: Logger;
  serverOptions?: McpServerOptions;
}): Promise<void> {
  const { config, client, logger, serverOptions } = params;

  const mcpServer = createMcpServer(serverOptions);
  registerHandlers(mcpServer, client, logger);

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  logger.info('Jenkins MCP Server started');
  logger.info('Connected to Jenkins', { url: sanitizeUrl(config.url) });
  logger.info('Available tools', { count: tools.length });
}
