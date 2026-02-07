/**
 * Centralized Jenkins config loader and URL sanitizer.
 * Target runtime: Node.js (ESM).
 *
 * Environment variables:
 * - JENKINS_URL (required)
 * - JENKINS_USERNAME (optional)
 * - JENKINS_PASSWORD or JENKINS_API_TOKEN (optional)
 * - JENKINS_TIMEOUT (optional, seconds; default 5)
 * - JENKINS_VERIFY_SSL (optional, default true; set "false" to disable)
 */

import type { JenkinsConfig } from '../types/jenkins.js';
import { parsePositiveInt } from '../utils/validation.js';

/**
 * Load Jenkins configuration from environment variables.
 * @param {NodeJS.ProcessEnv} env - Environment variables to read from.
 * @returns {JenkinsConfig} Parsed and validated Jenkins config.
 * @throws {Error} When required config is missing or invalid.
 */
export function loadJenkinsConfig(env: NodeJS.ProcessEnv = process.env): JenkinsConfig {
  const url = (env.JENKINS_URL || '').trim();

  if (!url) {
    throw new Error('JENKINS_URL environment variable is required');
  }

  const timeoutSeconds = parsePositiveInt(env.JENKINS_TIMEOUT, 5, 'JENKINS_TIMEOUT');

  return {
    url,
    username: env.JENKINS_USERNAME,
    password: env.JENKINS_PASSWORD || env.JENKINS_API_TOKEN,
    timeout: timeoutSeconds,
    verifySSL: env.JENKINS_VERIFY_SSL !== 'false',
  };
}

/**
 * Sanitize a URL by stripping embedded credentials.
 * @param {string} rawUrl - The raw URL to sanitize.
 * @returns {string} Sanitized URL without credentials.
 */
export function sanitizeUrl(rawUrl: string): string {
  try {
    const urlObj = new URL(rawUrl);
    if (urlObj.username || urlObj.password) {
      urlObj.username = '';
      urlObj.password = '';
      return urlObj.toString();
    }
    return urlObj.toString();
  } catch {
    return rawUrl;
  }
}
