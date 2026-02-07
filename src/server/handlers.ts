import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { JenkinsClient } from '../client/jenkins.js';
import { executeTool, tools } from '../tools/index.js';
import type { Logger } from '../utils/logger.js';

/**
 * Register MCP request handlers for tool listing and execution.
 * @param {McpServer} mcpServer - MCP server instance.
 * @param {JenkinsClient} jenkinsClient - Jenkins API client.
 * @param {Logger} logger - Structured logger.
 */
export function registerHandlers(
  mcpServer: McpServer,
  jenkinsClient: JenkinsClient,
  logger: Logger
): void {
  /**
   * Handler for listing available tools.
   */
  mcpServer.server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  /**
   * Handler for executing tools.
   */
  mcpServer.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await executeTool(
        jenkinsClient,
        name,
        (args ?? {}) as Record<string, unknown>,
        logger
      );
      return {
        content: [
          {
            type: 'text',
            text: formatToolResult(result),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Tool execution failed', { toolName: name, message });
      throw error;
    }
  });
}

function formatToolResult(result: unknown): string {
  if (typeof result === 'string') {
    return result;
  }
  return JSON.stringify(result, null, 2);
}
