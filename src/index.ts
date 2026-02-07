#!/usr/bin/env node

import { JenkinsClient } from './client/jenkins.js';
import { loadJenkinsConfig } from './config/jenkins-config.js';
import { startMcpServer } from './server/mcp-server.js';
import type { JenkinsConfig } from './types/jenkins.js';
import { createLogger } from './utils/logger.js';

/**
 * MCP Server for Jenkins
 * Provides AI-powered interactions with Jenkins CI/CD
 */
async function main(): Promise<void> {
  const logger = createLogger('jenkins-mcp-server');

  let config: JenkinsConfig;
  try {
    config = loadJenkinsConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown configuration error';
    logger.error('Configuration error', { message });
    process.exit(1);
    return;
  }

  let client: JenkinsClient;
  try {
    client = new JenkinsClient(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Jenkins client error';
    logger.error('Failed to initialize Jenkins client', { message });
    process.exit(1);
    return;
  }

  try {
    await startMcpServer({
      config,
      client,
      logger,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    logger.error('Fatal error during startup', { message });
    process.exit(1);
    return;
  }
}

main();
