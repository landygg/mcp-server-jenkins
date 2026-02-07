import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { JenkinsClient } from '../client/jenkins.js';
import type { Logger } from '../utils/logger.js';
import {
  handleGetBuild,
  handleGetBuildConsoleOutput,
  handleGetRunningBuilds,
  handleStopBuild,
} from './handlers/builds.js';
import {
  handleBuildItem,
  handleGetAllItems,
  handleGetItem,
  handleGetItemConfig,
  handleQueryItems,
} from './handlers/items.js';
import { handleGetAllNodes, handleGetNode, handleGetNodeConfig } from './handlers/nodes.js';
import {
  handleCancelQueueItem,
  handleGetAllQueueItems,
  handleGetQueueItem,
} from './handlers/queue.js';

/**
 * Tool handler signature.
 */
export type ToolHandler = (
  client: JenkinsClient,
  args: Record<string, unknown>
) => Promise<unknown>;

/**
 * Tool registry mapping tool names to handlers.
 */
const registry: Record<string, ToolHandler> = {
  get_all_items: async (client) => handleGetAllItems(client),
  get_item: async (client, args) => handleGetItem(client, args as any),
  get_item_config: async (client, args) => handleGetItemConfig(client, args as any),
  query_items: async (client, args) => handleQueryItems(client, args as any),
  build_item: async (client, args) => handleBuildItem(client, args as any),

  get_all_nodes: async (client) => handleGetAllNodes(client),
  get_node: async (client, args) => handleGetNode(client, args as any),
  get_node_config: async (client, args) => handleGetNodeConfig(client, args as any),

  get_all_queue_items: async (client) => handleGetAllQueueItems(client),
  get_queue_item: async (client, args) => handleGetQueueItem(client, args as any),
  cancel_queue_item: async (client, args) => handleCancelQueueItem(client, args as any),

  get_build: async (client, args) => handleGetBuild(client, args as any),
  get_build_console_output: async (client, args) =>
    handleGetBuildConsoleOutput(client, args as any),
  get_running_builds: async (client) => handleGetRunningBuilds(client),
  stop_build: async (client, args) => handleStopBuild(client, args as any),
};

/**
 * Execute a tool with runtime validation and consistent error mapping.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {string} toolName - Tool name.
 * @param {Record<string, unknown>} args - Tool arguments.
 * @param {Logger} [logger] - Optional logger for diagnostics.
 * @returns {Promise<unknown>} Tool result.
 */
export async function executeTool(
  client: JenkinsClient,
  toolName: string,
  args: Record<string, unknown>,
  logger?: Logger
): Promise<unknown> {
  const handler = registry[toolName];

  if (!handler) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }

  if (!isPlainObject(args)) {
    throw new McpError(ErrorCode.InvalidParams, 'Arguments must be an object');
  }

  try {
    return await handler(client, args);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger?.error('Tool execution failed', { toolName, message });

    if (message.toLowerCase().includes('required') || message.toLowerCase().includes('invalid')) {
      throw new McpError(ErrorCode.InvalidParams, message);
    }

    throw new McpError(ErrorCode.InternalError, `Failed to execute tool ${toolName}: ${message}`);
  }
}

/**
 * Get tool registry for inspection/testing.
 * @returns {Record<string, ToolHandler>} Registry map.
 */
export function getToolRegistry(): Record<string, ToolHandler> {
  return { ...registry };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}
