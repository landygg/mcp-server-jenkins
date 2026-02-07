import type { JenkinsClient } from '../../client/jenkins.js';
import { assertNonNegativeInt } from '../../utils/validation.js';

/**
 * Queue-related tool handlers.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */

export interface GetQueueItemArgs {
  queueId: number;
}

/**
 * Fetch all queue items.
 * @param {JenkinsClient} client - Jenkins API client.
 * @returns {Promise<unknown[]>} List of queue items.
 */
export async function handleGetAllQueueItems(client: JenkinsClient): Promise<unknown[]> {
  return await client.getAllQueueItems();
}

/**
 * Fetch a single queue item by ID.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetQueueItemArgs} args - Tool arguments.
 * @returns {Promise<unknown>} Queue item details.
 */
export async function handleGetQueueItem(
  client: JenkinsClient,
  args: GetQueueItemArgs
): Promise<unknown> {
  const queueId = assertNonNegativeInt(args?.queueId, 'queueId');
  return await client.getQueueItem(queueId);
}

/**
 * Cancel a queue item by ID.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetQueueItemArgs} args - Tool arguments.
 * @returns {Promise<{ success: true }>} Success flag.
 */
export async function handleCancelQueueItem(
  client: JenkinsClient,
  args: GetQueueItemArgs
): Promise<{ success: true }> {
  const queueId = assertNonNegativeInt(args?.queueId, 'queueId');
  await client.cancelQueueItem(queueId);
  return { success: true };
}
