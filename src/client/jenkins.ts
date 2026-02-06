import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';
import type {
  JenkinsBuild,
  JenkinsConfig,
  JenkinsItem,
  JenkinsNode,
  JenkinsQueueItem,
} from '../types/jenkins.js';

/**
 * Jenkins API Client
 * Handles all communication with Jenkins server
 */
export class JenkinsClient {
  private client: AxiosInstance;
  private crumbCache: { crumb: string; field: string } | null | undefined = undefined;

  constructor(config: JenkinsConfig) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.url,
      timeout: (config.timeout || 5) * 1000, // Convert seconds to milliseconds
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable connection pooling with keep-alive
      httpAgent: new http.Agent({
        keepAlive: true,
        maxSockets: 10,
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 10,
        rejectUnauthorized: config.verifySSL !== false,
      }),
    };

    // Add authentication if provided
    if (config.username && config.password) {
      axiosConfig.auth = {
        username: config.username,
        password: config.password,
      };
    }

    // Override HTTPS agent if SSL verification is disabled
    // Security Note: SSL verification can be disabled for development or self-signed certificates
    // This is opt-in via JENKINS_VERIFY_SSL=false and defaults to true (secure)
    if (config.verifySSL === false) {
      axiosConfig.httpsAgent = new https.Agent({
        keepAlive: true,
        maxSockets: 10,
        rejectUnauthorized: false,
      });
    }

    this.client = axios.create(axiosConfig);
  }

  /**
   * Get Jenkins crumb for CSRF protection
   * Caches the crumb to avoid repeated requests
   */
  private async getCrumb(): Promise<{ crumb: string; field: string } | null> {
    // Return cached result if already fetched (either valid crumb or null for "not available")
    if (this.crumbCache !== undefined) {
      return this.crumbCache;
    }

    try {
      const response = await this.client.get('/crumbIssuer/api/json');
      this.crumbCache = {
        crumb: response.data.crumb,
        field: response.data.crumbRequestField,
      };
      return this.crumbCache;
    } catch (error) {
      // If crumb endpoint doesn't exist, Jenkins may not have CSRF protection enabled
      // Cache null as sentinel value to avoid repeated failed requests
      this.crumbCache = null;

      // Log sanitized error to avoid leaking credentials
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const code = error.code;
        console.error('Failed to fetch Jenkins crumb (CSRF may not be enabled):', {
          status,
          statusText,
          code,
          message: error.message,
        });
      } else {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to fetch Jenkins crumb (CSRF may not be enabled):', {
          message,
        });
      }
      return null;
    }
  }

  /**
   * Add crumb header to request config if available
   */
  private async addCrumbHeaders(config: AxiosRequestConfig = {}): Promise<AxiosRequestConfig> {
    const crumb = await this.getCrumb();
    if (crumb) {
      return {
        ...config,
        headers: {
          ...config.headers,
          [crumb.field]: crumb.crumb,
        },
      };
    }
    return config;
  }

  /**
   * Get all items (jobs and folders) from Jenkins
   */
  async getAllItems(): Promise<JenkinsItem[]> {
    const response = await this.client.get(
      '/api/json?tree=jobs[name,url,color,_class,fullName,buildable]'
    );
    return response.data.jobs || [];
  }

  /**
   * Get specific item by name
   */
  async getItem(fullName: string): Promise<JenkinsItem> {
    const response = await this.client.get(
      `/job/${this.encodeJobName(fullName)}/api/json?tree=name,url,color,_class,fullName,buildable,builds[number,url,result,building,timestamp,duration],lastBuild[number,url,result],lastSuccessfulBuild[number,url,result],lastFailedBuild[number,url,result]`
    );
    return response.data;
  }

  /**
   * Get item configuration XML
   */
  async getItemConfig(fullName: string): Promise<string> {
    const response = await this.client.get(`/job/${this.encodeJobName(fullName)}/config.xml`, {
      headers: { Accept: 'application/xml' },
    });
    return response.data;
  }

  /**
   * Query items with filters
   */
  async queryItems(params: {
    classPattern?: string;
    fullNamePattern?: string;
    colorPattern?: string;
  }): Promise<JenkinsItem[]> {
    // Pre-compile regexes to validate and provide clear errors
    let classRegex: RegExp | null = null;
    let fullNameRegex: RegExp | null = null;
    let colorRegex: RegExp | null = null;

    try {
      if (params.classPattern) {
        classRegex = new RegExp(params.classPattern);
      }
      if (params.fullNamePattern) {
        fullNameRegex = new RegExp(params.fullNamePattern);
      }
      if (params.colorPattern) {
        colorRegex = new RegExp(params.colorPattern);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid regex pattern';
      throw new Error(`Invalid regex pattern: ${message}`);
    }

    const allItems = await this.getAllItems();

    return allItems.filter((item) => {
      if (classRegex && !classRegex.test(item._class)) {
        return false;
      }
      if (fullNameRegex && !fullNameRegex.test(item.fullName)) {
        return false;
      }
      if (colorRegex) {
        if (!item.color) {
          return false;
        }
        if (!colorRegex.test(item.color)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Build an item
   */
  async buildItem(fullName: string, parameters?: Record<string, string>): Promise<number> {
    const endpoint = parameters
      ? `/job/${this.encodeJobName(fullName)}/buildWithParameters`
      : `/job/${this.encodeJobName(fullName)}/build`;

    const config = await this.addCrumbHeaders({
      params: parameters,
    });

    const response = await this.client.post(endpoint, parameters || {}, config);

    // Jenkins returns the queue item location in the Location header
    const location = response.headers.location;

    if (!location) {
      throw new Error(
        'Jenkins did not return a queue location (Location header missing) for build request.'
      );
    }

    const idSegment = location.split('/').slice(-2, -1)[0];
    const queueId = Number.parseInt(idSegment, 10);

    if (Number.isNaN(queueId) || !Number.isInteger(queueId) || queueId < 0) {
      throw new Error(`Jenkins returned an invalid queue id in Location header: "${location}".`);
    }

    return queueId;
  }

  /**
   * Get all nodes
   */
  async getAllNodes(): Promise<JenkinsNode[]> {
    const response = await this.client.get(
      '/computer/api/json?tree=computer[displayName,description,numExecutors,offline,temporarilyOffline]'
    );
    return response.data.computer || [];
  }

  /**
   * Get specific node
   */
  async getNode(nodeName: string): Promise<JenkinsNode> {
    const response = await this.client.get(`/computer/${encodeURIComponent(nodeName)}/api/json`);
    return response.data;
  }

  /**
   * Get node configuration
   */
  async getNodeConfig(nodeName: string): Promise<string> {
    const response = await this.client.get(`/computer/${encodeURIComponent(nodeName)}/config.xml`, {
      headers: { Accept: 'application/xml' },
    });
    return response.data;
  }

  /**
   * Get all queue items
   */
  async getAllQueueItems(): Promise<JenkinsQueueItem[]> {
    const response = await this.client.get(
      '/queue/api/json?tree=items[id,task[name,url],why,blocked,buildable,stuck]'
    );
    return response.data.items || [];
  }

  /**
   * Get specific queue item
   */
  async getQueueItem(queueId: number): Promise<JenkinsQueueItem> {
    const response = await this.client.get(`/queue/item/${queueId}/api/json`);
    return response.data;
  }

  /**
   * Cancel queue item
   */
  async cancelQueueItem(queueId: number): Promise<void> {
    const config = await this.addCrumbHeaders();
    await this.client.post(`/queue/cancelItem?id=${queueId}`, {}, config);
  }

  /**
   * Get specific build
   */
  async getBuild(fullName: string, buildNumber: number): Promise<JenkinsBuild> {
    const response = await this.client.get(
      `/job/${this.encodeJobName(fullName)}/${buildNumber}/api/json`
    );
    return response.data;
  }

  /**
   * Get build console output
   */
  async getBuildConsoleOutput(fullName: string, buildNumber: number): Promise<string> {
    const response = await this.client.get(
      `/job/${this.encodeJobName(fullName)}/${buildNumber}/consoleText`,
      { headers: { Accept: 'text/plain' } }
    );
    return response.data;
  }

  /**
   * Get all running builds
   * Optimized to query only lastBuild for efficiency
   */
  async getRunningBuilds(): Promise<JenkinsBuild[]> {
    const response = await this.client.get(
      '/api/json?tree=jobs[fullName,lastBuild[number,url,building,timestamp,duration]]'
    );
    const jobs = response.data.jobs || [];

    const runningBuilds: JenkinsBuild[] = [];
    for (const job of jobs) {
      const lastBuild = job.lastBuild;
      if (lastBuild?.building) {
        runningBuilds.push({
          ...lastBuild,
          fullDisplayName: `${job.fullName} #${lastBuild.number}`,
        });
      }
    }

    return runningBuilds;
  }

  /**
   * Stop a build
   */
  async stopBuild(fullName: string, buildNumber: number): Promise<void> {
    const config = await this.addCrumbHeaders();
    await this.client.post(`/job/${this.encodeJobName(fullName)}/${buildNumber}/stop`, {}, config);
  }

  /**
   * Encode job name for URL (handles folder structure)
   */
  private encodeJobName(fullName: string): string {
    return fullName.split('/').map(encodeURIComponent).join('/job/');
  }
}
