import type { JenkinsClient } from '../../client/jenkins.js';
import type { JenkinsNode } from '../../types/jenkins.js';
import { assertNonEmptyString } from '../../utils/validation.js';

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
 * @returns {Promise<JenkinsNode[]>} List of Jenkins nodes.
 */
export async function handleGetAllNodes(client: JenkinsClient): Promise<JenkinsNode[]> {
  return await client.getAllNodes();
}

/**
 * Fetch a specific Jenkins node by name.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetNodeArgs} args - Tool arguments.
 * @returns {Promise<JenkinsNode>} Node details.
 */
export async function handleGetNode(
  client: JenkinsClient,
  args: GetNodeArgs
): Promise<JenkinsNode> {
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
