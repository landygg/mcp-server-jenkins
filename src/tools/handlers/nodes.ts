import type { JenkinsClient } from '../../client/jenkins.js';

/**
 * Node-related tool handlers.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */

export interface GetNodeArgs {
  nodeName: string;
}

/**
 * Fetch all Jenkins nodes.
 * @param {JenkinsClient} client - Jenkins API client.
 * @returns {Promise<unknown[]>} List of Jenkins nodes.
 */
export async function handleGetAllNodes(client: JenkinsClient): Promise<unknown[]> {
  return await client.getAllNodes();
}

/**
 * Fetch a specific Jenkins node by name.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetNodeArgs} args - Tool arguments.
 * @returns {Promise<unknown>} Node details.
 */
export async function handleGetNode(client: JenkinsClient, args: GetNodeArgs): Promise<unknown> {
  assertNonEmptyString(args?.nodeName, 'nodeName');
  return await client.getNode(args.nodeName);
}

/**
 * Fetch Jenkins node configuration XML.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetNodeArgs} args - Tool arguments.
 * @returns {Promise<string>} XML configuration.
 */
export async function handleGetNodeConfig(
  client: JenkinsClient,
  args: GetNodeArgs
): Promise<string> {
  assertNonEmptyString(args?.nodeName, 'nodeName');
  return await client.getNodeConfig(args.nodeName);
}

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} is required and must be a non-empty string`);
  }
}
