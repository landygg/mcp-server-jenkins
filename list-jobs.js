#!/usr/bin/env node

/**
 * Simple script to list all Jenkins jobs.
 * Run: node list-jobs.js
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JenkinsClient } from './dist/client/jenkins.js';
import { loadJenkinsConfig, sanitizeUrl } from './dist/config/jenkins-config.js';

/**
 * Load environment variables from a local .env file (if present).
 * This keeps the script self-contained without external deps.
 * @returns {void}
 */
function loadDotEnv() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = join(__dirname, '.env');

  try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log('✓ Loaded configuration from .env file\n');
  } catch (error) {
    const code = error?.code;
    if (code !== 'ENOENT') {
      const message = error instanceof Error ? error.message : String(error);
      console.error('⚠️ Failed to load .env file:', message);
    }
    console.log('ℹ Using environment variables (no .env file found)\n');
  }
}

/**
 * Render a status icon for a Jenkins job color.
 * @param {string | undefined} color - Jenkins color string.
 * @returns {string} Emoji icon.
 */
function getStatusIcon(color) {
  if (!color) return '⚪';

  const iconMap = {
    blue: '🟢', // Success
    blue_anime: '🔵', // Building (successful)
    red: '🔴', // Failed
    red_anime: '🔴', // Building (previously failed)
    yellow: '🟡', // Unstable
    yellow_anime: '🟡', // Building (unstable)
    grey: '⚪', // Not built
    grey_anime: '⚪', // Building (never built)
    disabled: '⚫', // Disabled
    aborted: '🟠', // Aborted
    notbuilt: '⚪', // Not built
  };

  return iconMap[color] || '⚪';
}



/**
 * Fetch and print Jenkins jobs.
 * @returns {Promise<void>}
 */
async function listJobs() {
  try {
    if (!process.env.JENKINS_TIMEOUT) {
      process.env.JENKINS_TIMEOUT = '60';
    }
    const config = loadJenkinsConfig();
    const client = new JenkinsClient(config);

    console.log(`🔍 Connecting to Jenkins: ${sanitizeUrl(config.url)}`);
    console.log('📡 Fetching all jobs...\n');

    const items = await client.getAllItems();

    if (items.length === 0) {
      console.log('⚠️  No Jenkins jobs found');
      return;
    }

    console.log(`✓ Found ${items.length} Jenkins items\n`);
    console.log('='.repeat(100));

    // Group by type
    const grouped = {};
    for (const item of items) {
      const type = item._class.split('.').pop();
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    }

    // Display grouped
    for (const [type, typeItems] of Object.entries(grouped)) {
      console.log(`\n📋 ${type} (${typeItems.length} items)`);
      console.log('-'.repeat(100));

      for (const item of typeItems) {
        const statusIcon = getStatusIcon(item.color);
        console.log(`\n  ${statusIcon} ${item.fullName || item.name}`);

        if (item.buildable !== undefined) {
          console.log(`     Buildable: ${item.buildable ? '✓ Yes' : '✗ No'}`);
        }

        if (item.color) {
          console.log(`     Status: ${item.color}`);
        }

        console.log(`     URL: ${item.url}`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log(`\n📊 Summary: ${items.length} total items`);

    // Show count by type
    console.log('\nBreakdown by type:');
    for (const [type, typeItems] of Object.entries(grouped)) {
      console.log(`  • ${type}: ${typeItems.length}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = error?.code;
    const status = error?.response?.status;

    console.error('\n❌ Error fetching Jenkins jobs:', message);

    if (code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Check if Jenkins URL is correct and accessible');
    } else if (status === 401) {
      console.error('\n💡 Tip: Check your Jenkins credentials (username/password)');
    } else if (status === 403) {
      console.error('\n💡 Tip: Your user may not have permission to access Jenkins API');
    }

    process.exit(1);
  }
}

loadDotEnv();
listJobs();
