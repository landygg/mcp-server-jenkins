import type { AxiosRequestConfig } from 'axios';
import type { JenkinsQueueItem } from '../../types/jenkins.js';
import type { JenkinsHttpClient } from '../http-client.js';
import { queueCancelPath, queueItemPath } from '../paths.js';

/**
 * Options for Queue API helpers.
 */
export interface QueueApiOptions {
  /**
   * Optional helper to add CSRF crumb headers.
   * When provided, it is applied to write operations.
   */
  addCrumbHeaders?: (config?: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
}

/**
 * Wrapper around Jenkins queue APIs.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class QueueApi {
  private readonly client: JenkinsHttpClient;
  private readonly addCrumbHeaders?: QueueApiOptions['addCrumbHeaders'];

  constructor(client: JenkinsHttpClient, options: QueueApiOptions = {}) {
    this.client = client;
    this.addCrumbHeaders = options.addCrumbHeaders;
  }

  /**
   * Get all queue items.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsQueueItem[]>} List of queue items.
   */
  async getAllQueueItems(config: AxiosRequestConfig = {}): Promise<JenkinsQueueItem[]> {
    const response = await this.client.get<{ items?: JenkinsQueueItem[] }>(
      '/queue/api/json?tree=items[id,task[name,url],why,blocked,buildable,stuck]',
      config
    );
    return response.data.items || [];
  }

  /**
   * Get a specific queue item by id.
   * @param {number} queueId - Queue item id.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsQueueItem>} Queue item details.
   */
  async getQueueItem(queueId: number, config: AxiosRequestConfig = {}): Promise<JenkinsQueueItem> {
    const response = await this.client.get<JenkinsQueueItem>(queueItemPath(queueId), config);
    return response.data;
  }

  /**
   * Cancel a queue item by id.
   * @param {number} queueId - Queue item id.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<void>} Resolves when canceled.
   */
  async cancelQueueItem(queueId: number, config: AxiosRequestConfig = {}): Promise<void> {
    const requestConfig = await this.applyCrumbHeaders(config);
    await this.client.post(queueCancelPath(queueId), {}, requestConfig);
  }

  private async applyCrumbHeaders(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (!this.addCrumbHeaders) return config;
    return await this.addCrumbHeaders(config);
  }
}
