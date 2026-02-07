import type { JenkinsClient } from '../../client/jenkins.js';

/**
 * Item-related tool handlers.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */

export interface GetItemArgs {
  fullName: string;
}

export interface QueryItemsArgs {
  classPattern?: string;
  fullNamePattern?: string;
  colorPattern?: string;
}

export interface BuildItemArgs {
  fullName: string;
  parameters?: Record<string, string>;
}

/**
 * Fetch all items (jobs and folders).
 * @param {JenkinsClient} client - Jenkins API client.
 * @returns {Promise<unknown[]>} List of Jenkins items.
 */
export async function handleGetAllItems(client: JenkinsClient): Promise<unknown[]> {
  return await client.getAllItems();
}

/**
 * Fetch a single item by full name.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetItemArgs} args - Tool arguments.
 * @returns {Promise<unknown>} Jenkins item details.
 */
export async function handleGetItem(client: JenkinsClient, args: GetItemArgs): Promise<unknown> {
  assertNonEmptyString(args?.fullName, 'fullName');
  return await client.getItem(args.fullName);
}

/**
 * Fetch item configuration XML.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {GetItemArgs} args - Tool arguments.
 * @returns {Promise<string>} XML configuration.
 */
export async function handleGetItemConfig(
  client: JenkinsClient,
  args: GetItemArgs
): Promise<string> {
  assertNonEmptyString(args?.fullName, 'fullName');
  return await client.getItemConfig(args.fullName);
}

/**
 * Query items using regex filters.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {QueryItemsArgs} args - Tool arguments.
 * @returns {Promise<unknown[]>} Filtered Jenkins items.
 */
export async function handleQueryItems(
  client: JenkinsClient,
  args: QueryItemsArgs
): Promise<unknown[]> {
  const params: QueryItemsArgs = {
    classPattern: normalizeOptionalString(args?.classPattern),
    fullNamePattern: normalizeOptionalString(args?.fullNamePattern),
    colorPattern: normalizeOptionalString(args?.colorPattern),
  };

  return await client.queryItems(params);
}

/**
 * Trigger a build for an item.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {BuildItemArgs} args - Tool arguments.
 * @returns {Promise<number>} Queue ID.
 */
export async function handleBuildItem(client: JenkinsClient, args: BuildItemArgs): Promise<number> {
  assertNonEmptyString(args?.fullName, 'fullName');

  if (args?.parameters !== undefined && !isPlainObject(args.parameters)) {
    throw new Error('parameters must be an object with string values');
  }

  return await client.buildItem(args.fullName, args?.parameters);
}

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} is required and must be a non-empty string`);
  }
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isPlainObject(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object') return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}
