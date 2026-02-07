/**
 * Jenkins job path utilities.
 * Target runtime: Node.js (ESM).
 */

/**
 * Encode a job full name into a Jenkins API path segment.
 * Handles folder nesting by inserting `/job/` between segments.
 *
 * @param {string} fullName - Job full name (e.g., "folder/sub/job-name").
 * @returns {string} Encoded path segment (e.g., "folder/job/sub/job/job-name").
 */
export function encodeJobName(fullName: string): string {
  return fullName.split('/').map(encodeURIComponent).join('/job/');
}

/**
 * Build a Jenkins API path for a job resource.
 *
 * @param {string} fullName - Job full name.
 * @returns {string} Job path (e.g., "/job/folder/job/name").
 */
export function jobPath(fullName: string): string {
  return `/job/${encodeJobName(fullName)}`;
}

/**
 * Build a Jenkins API path for a specific build.
 *
 * @param {string} fullName - Job full name.
 * @param {number} buildNumber - Build number.
 * @returns {string} Build path (e.g., "/job/name/42").
 */
export function buildPath(fullName: string, buildNumber: number): string {
  return `${jobPath(fullName)}/${buildNumber}`;
}

/**
 * Build a Jenkins API path for build console text.
 *
 * @param {string} fullName - Job full name.
 * @param {number} buildNumber - Build number.
 * @returns {string} Console text path.
 */
export function buildConsolePath(fullName: string, buildNumber: number): string {
  return `${buildPath(fullName, buildNumber)}/consoleText`;
}

/**
 * Build a Jenkins API path for build stop action.
 *
 * @param {string} fullName - Job full name.
 * @param {number} buildNumber - Build number.
 * @returns {string} Stop build path.
 */
export function stopBuildPath(fullName: string, buildNumber: number): string {
  return `${buildPath(fullName, buildNumber)}/stop`;
}

/**
 * Build a Jenkins API path for job configuration XML.
 *
 * @param {string} fullName - Job full name.
 * @returns {string} Config XML path.
 */
export function jobConfigPath(fullName: string): string {
  return `${jobPath(fullName)}/config.xml`;
}

/**
 * Build a Jenkins API path for triggering a job build.
 *
 * @param {string} fullName - Job full name.
 * @param {boolean} [withParameters] - Whether to use buildWithParameters endpoint.
 * @returns {string} Build trigger path.
 */
export function buildTriggerPath(fullName: string, withParameters = false): string {
  return withParameters ? `${jobPath(fullName)}/buildWithParameters` : `${jobPath(fullName)}/build`;
}

/**
 * Build a Jenkins API path for node configuration XML.
 *
 * @param {string} nodeName - Node name.
 * @returns {string} Node config XML path.
 */
export function nodeConfigPath(nodeName: string): string {
  return `/computer/${encodeURIComponent(nodeName)}/config.xml`;
}

/**
 * Build a Jenkins API path for node details.
 *
 * @param {string} nodeName - Node name.
 * @returns {string} Node details path.
 */
export function nodePath(nodeName: string): string {
  return `/computer/${encodeURIComponent(nodeName)}/api/json`;
}

/**
 * Build a Jenkins API path for a queue item.
 *
 * @param {number} queueId - Queue item ID.
 * @returns {string} Queue item path.
 */
export function queueItemPath(queueId: number): string {
  return `/queue/item/${queueId}/api/json`;
}

/**
 * Build a Jenkins API path for canceling a queue item.
 *
 * @param {number} queueId - Queue item ID.
 * @returns {string} Queue cancel path.
 */
export function queueCancelPath(queueId: number): string {
  return `/queue/cancelItem?id=${queueId}`;
}
