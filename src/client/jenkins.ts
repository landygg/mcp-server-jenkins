import type {
  JenkinsBuild,
  JenkinsConfig,
  JenkinsItem,
  JenkinsNode,
  JenkinsQueueItem,
} from '../types/jenkins.js';
import { BuildsApi } from './apis/builds-api.js';
import { ItemsApi } from './apis/items-api.js';
import { NodesApi } from './apis/nodes-api.js';
import { QueueApi } from './apis/queue-api.js';
import { type CrumbIssuer, createCrumbIssuer } from './crumb-issuer.js';
import { JenkinsHttpClient } from './http-client.js';

/**
 * Jenkins API Client
 * Coordinates HTTP client, CSRF crumb handling, and API modules.
 *
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class JenkinsClient {
  private readonly httpClient: JenkinsHttpClient;
  private readonly crumbIssuer: CrumbIssuer;
  private readonly itemsApi: ItemsApi;
  private readonly buildsApi: BuildsApi;
  private readonly nodesApi: NodesApi;
  private readonly queueApi: QueueApi;

  constructor(config: JenkinsConfig) {
    this.httpClient = new JenkinsHttpClient(config);
    this.crumbIssuer = createCrumbIssuer(this.httpClient.getAxiosInstance());

    const addCrumbHeaders = (cfg = {}) => this.crumbIssuer.addCrumbHeaders(cfg);

    this.itemsApi = new ItemsApi(this.httpClient, { addCrumbHeaders });
    this.buildsApi = new BuildsApi(this.httpClient, { addCrumbHeaders });
    this.nodesApi = new NodesApi(this.httpClient);
    this.queueApi = new QueueApi(this.httpClient, { addCrumbHeaders });
  }

  /**
   * Get all items (jobs and folders) from Jenkins.
   */
  async getAllItems(): Promise<JenkinsItem[]> {
    return await this.itemsApi.getAllItems();
  }

  /**
   * Get specific item by name.
   */
  async getItem(fullName: string): Promise<JenkinsItem> {
    return await this.itemsApi.getItem(fullName);
  }

  /**
   * Get item configuration XML.
   */
  async getItemConfig(fullName: string): Promise<string> {
    return await this.itemsApi.getItemConfig(fullName);
  }

  /**
   * Query items with filters.
   */
  async queryItems(params: {
    classPattern?: string;
    fullNamePattern?: string;
    colorPattern?: string;
  }): Promise<JenkinsItem[]> {
    return await this.itemsApi.queryItems(params);
  }

  /**
   * Build an item.
   */
  async buildItem(fullName: string, parameters?: Record<string, string>): Promise<number> {
    return await this.itemsApi.buildItem(fullName, parameters);
  }

  /**
   * Get all nodes.
   */
  async getAllNodes(): Promise<JenkinsNode[]> {
    return await this.nodesApi.getAllNodes();
  }

  /**
   * Get specific node.
   */
  async getNode(nodeName: string): Promise<JenkinsNode> {
    return await this.nodesApi.getNode(nodeName);
  }

  /**
   * Get node configuration.
   */
  async getNodeConfig(nodeName: string): Promise<string> {
    return await this.nodesApi.getNodeConfig(nodeName);
  }

  /**
   * Get all queue items.
   */
  async getAllQueueItems(): Promise<JenkinsQueueItem[]> {
    return await this.queueApi.getAllQueueItems();
  }

  /**
   * Get specific queue item.
   */
  async getQueueItem(queueId: number): Promise<JenkinsQueueItem> {
    return await this.queueApi.getQueueItem(queueId);
  }

  /**
   * Cancel queue item.
   */
  async cancelQueueItem(queueId: number): Promise<void> {
    await this.queueApi.cancelQueueItem(queueId);
  }

  /**
   * Get specific build.
   */
  async getBuild(fullName: string, buildNumber: number): Promise<JenkinsBuild> {
    return await this.buildsApi.getBuild(fullName, buildNumber);
  }

  /**
   * Get build console output.
   */
  async getBuildConsoleOutput(fullName: string, buildNumber: number): Promise<string> {
    return await this.buildsApi.getBuildConsoleOutput(fullName, buildNumber);
  }

  /**
   * Get all running builds.
   */
  async getRunningBuilds(): Promise<JenkinsBuild[]> {
    return await this.buildsApi.getRunningBuilds();
  }

  /**
   * Stop a build.
   */
  async stopBuild(fullName: string, buildNumber: number): Promise<void> {
    await this.buildsApi.stopBuild(fullName, buildNumber);
  }
}
