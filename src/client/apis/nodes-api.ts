import type { AxiosRequestConfig } from 'axios';
import type { JenkinsNode } from '../../types/jenkins.js';
import type { JenkinsHttpClient } from '../http-client.js';
import { nodeConfigPath, nodePath } from '../paths.js';
import { unwrapList, withAcceptHeader } from './api-utils.js';

/**
 * Wrapper around Jenkins node APIs.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class NodesApi {
  private readonly client: JenkinsHttpClient;

  constructor(client: JenkinsHttpClient) {
    this.client = client;
  }

  /**
   * Get all Jenkins nodes.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsNode[]>} List of nodes.
   */
  async getAllNodes(config: AxiosRequestConfig = {}): Promise<JenkinsNode[]> {
    const response = await this.client.get<{ computer?: JenkinsNode[] }>(
      '/computer/api/json?tree=computer[displayName,description,numExecutors,offline,temporarilyOffline]',
      config
    );
    return unwrapList(response.data.computer);
  }

  /**
   * Get a specific node by name.
   * @param {string} nodeName - Node name.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsNode>} Node details.
   */
  async getNode(nodeName: string, config: AxiosRequestConfig = {}): Promise<JenkinsNode> {
    const response = await this.client.get<JenkinsNode>(nodePath(nodeName), config);
    return response.data;
  }

  /**
   * Get node configuration XML.
   * @param {string} nodeName - Node name.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<string>} XML config.
   */
  async getNodeConfig(nodeName: string, config: AxiosRequestConfig = {}): Promise<string> {
    const response = await this.client.get<string>(
      nodeConfigPath(nodeName),
      withAcceptHeader(config, 'application/xml')
    );
    return response.data;
  }
}
