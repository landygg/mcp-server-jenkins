import type { JenkinsClient } from '../../client/jenkins.js';

/**
 * Build-related tool handlers.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */

export interface BuildArgs {
  fullName: string;
  buildNumber: number;
}

/**
 * Fetch build details.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {BuildArgs} args - Tool arguments.
 * @returns {Promise<unknown>} Build details.
 */
export async function handleGetBuild(client: JenkinsClient, args: BuildArgs): Promise<unknown> {
  assertNonEmptyString(args?.fullName, 'fullName');
  const buildNumber = assertPositiveInt(args?.buildNumber, 'buildNumber');
  return await client.getBuild(args.fullName, buildNumber);
}

/**
 * Fetch build console output.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {BuildArgs} args - Tool arguments.
 * @returns {Promise<string>} Console output text.
 */
export async function handleGetBuildConsoleOutput(
  client: JenkinsClient,
  args: BuildArgs
): Promise<string> {
  assertNonEmptyString(args?.fullName, 'fullName');
  const buildNumber = assertPositiveInt(args?.buildNumber, 'buildNumber');
  return await client.getBuildConsoleOutput(args.fullName, buildNumber);
}

/**
 * Fetch all running builds.
 * @param {JenkinsClient} client - Jenkins API client.
 * @returns {Promise<unknown[]>} List of running builds.
 */
export async function handleGetRunningBuilds(client: JenkinsClient): Promise<unknown[]> {
  return await client.getRunningBuilds();
}

/**
 * Stop a running build.
 * @param {JenkinsClient} client - Jenkins API client.
 * @param {BuildArgs} args - Tool arguments.
 * @returns {Promise<{ success: true }>} Success flag.
 */
export async function handleStopBuild(
  client: JenkinsClient,
  args: BuildArgs
): Promise<{ success: true }> {
  assertNonEmptyString(args?.fullName, 'fullName');
  const buildNumber = assertPositiveInt(args?.buildNumber, 'buildNumber');
  await client.stopBuild(args.fullName, buildNumber);
  return { success: true };
}

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} is required and must be a non-empty string`);
  }
}

function assertPositiveInt(value: unknown, label: string): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}
