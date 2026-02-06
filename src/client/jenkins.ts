import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import { JenkinsConfig, JenkinsItem, JenkinsBuild, JenkinsQueueItem, JenkinsNode } from '../types/jenkins.js';

/**
 * Jenkins API Client
 * Handles all communication with Jenkins server
 */
export class JenkinsClient {
  private client: AxiosInstance;
  private config: JenkinsConfig;

  constructor(config: JenkinsConfig) {
    this.config = config;

    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.url,
      timeout: (config.timeout || 5) * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add authentication if provided
    if (config.username && config.password) {
      axiosConfig.auth = {
        username: config.username,
        password: config.password,
      };
    }

    // Handle SSL verification
    if (config.verifySSL === false) {
      axiosConfig.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }

    this.client = axios.create(axiosConfig);
  }

  /**
   * Get all items (jobs and folders) from Jenkins
   */
  async getAllItems(): Promise<JenkinsItem[]> {
    const response = await this.client.get('/api/json?tree=jobs[name,url,color,_class,fullName,buildable]');
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
    const allItems = await this.getAllItems();
    
    return allItems.filter(item => {
      if (params.classPattern && !new RegExp(params.classPattern).test(item._class)) {
        return false;
      }
      if (params.fullNamePattern && !new RegExp(params.fullNamePattern).test(item.fullName)) {
        return false;
      }
      if (params.colorPattern && item.color && !new RegExp(params.colorPattern).test(item.color)) {
        return false;
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
    
    const response = await this.client.post(endpoint, parameters || {}, {
      params: parameters,
    });
    
    // Jenkins returns the queue item location in the Location header
    const location = response.headers['location'];
    if (location) {
      const queueId = parseInt(location.split('/').slice(-2, -1)[0]);
      return queueId;
    }
    
    return 0;
  }

  /**
   * Get all nodes
   */
  async getAllNodes(): Promise<JenkinsNode[]> {
    const response = await this.client.get('/computer/api/json?tree=computer[displayName,description,numExecutors,offline,temporarilyOffline]');
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
    const response = await this.client.get('/queue/api/json?tree=items[id,task[name,url],why,blocked,buildable,stuck]');
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
    await this.client.post(`/queue/cancelItem?id=${queueId}`);
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
   */
  async getRunningBuilds(): Promise<JenkinsBuild[]> {
    const response = await this.client.get('/api/json?tree=jobs[name,fullName,builds[number,url,result,building,timestamp,duration]]');
    const jobs = response.data.jobs || [];
    
    const runningBuilds: JenkinsBuild[] = [];
    for (const job of jobs) {
      if (job.builds) {
        for (const build of job.builds) {
          if (build.building) {
            runningBuilds.push({
              ...build,
              fullDisplayName: `${job.fullName} #${build.number}`,
            });
          }
        }
      }
    }
    
    return runningBuilds;
  }

  /**
   * Stop a build
   */
  async stopBuild(fullName: string, buildNumber: number): Promise<void> {
    await this.client.post(`/job/${this.encodeJobName(fullName)}/${buildNumber}/stop`);
  }

  /**
   * Encode job name for URL (handles folder structure)
   */
  private encodeJobName(fullName: string): string {
    return fullName.split('/').map(encodeURIComponent).join('/job/');
  }
}
