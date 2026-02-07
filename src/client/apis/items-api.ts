import type { AxiosRequestConfig } from 'axios';
import type { JenkinsItem } from '../../types/jenkins.js';
import type { JenkinsHttpClient } from '../http-client.js';
import { buildTriggerPath, jobConfigPath, jobPath } from '../paths.js';

/**
 * Item query filters for client-side filtering.
 */
export interface QueryItemsParams {
  classPattern?: string;
  fullNamePattern?: string;
  colorPattern?: string;
}

/**
 * Options for Items API helpers.
 */
export interface ItemsApiOptions {
  /**
   * Optional helper to add CSRF crumb headers.
   * When provided, it is applied to write operations.
   */
  addCrumbHeaders?: (config?: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
}

/**
 * Wrapper around Jenkins item APIs.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class ItemsApi {
  private readonly client: JenkinsHttpClient;
  private readonly addCrumbHeaders?: ItemsApiOptions['addCrumbHeaders'];

  constructor(client: JenkinsHttpClient, options: ItemsApiOptions = {}) {
    this.client = client;
    this.addCrumbHeaders = options.addCrumbHeaders;
  }

  /**
   * Get all items (jobs and folders) from Jenkins.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsItem[]>} List of items.
   */
  async getAllItems(config: AxiosRequestConfig = {}): Promise<JenkinsItem[]> {
    const response = await this.client.get<{ jobs?: JenkinsItem[] }>(
      '/api/json?tree=jobs[name,url,color,_class,fullName,buildable]',
      config
    );
    return response.data.jobs || [];
  }

  /**
   * Get specific item by full name.
   * @param {string} fullName - Job full name.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsItem>} Item details.
   */
  async getItem(fullName: string, config: AxiosRequestConfig = {}): Promise<JenkinsItem> {
    const response = await this.client.get<JenkinsItem>(
      `${jobPath(fullName)}/api/json?tree=name,url,color,_class,fullName,buildable,builds[number,url,result,building,timestamp,duration],lastBuild[number,url,result],lastSuccessfulBuild[number,url,result],lastFailedBuild[number,url,result]`,
      config
    );
    return response.data;
  }

  /**
   * Get item configuration XML.
   * @param {string} fullName - Job full name.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<string>} XML config.
   */
  async getItemConfig(fullName: string, config: AxiosRequestConfig = {}): Promise<string> {
    const response = await this.client.get<string>(jobConfigPath(fullName), {
      ...config,
      headers: {
        Accept: 'application/xml',
        ...(config.headers ?? {}),
      },
    });
    return response.data;
  }

  /**
   * Query items with client-side filters.
   * @param {QueryItemsParams} params - Regex filters.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsItem[]>} Filtered items.
   */
  async queryItems(
    params: QueryItemsParams,
    config: AxiosRequestConfig = {}
  ): Promise<JenkinsItem[]> {
    const regex = compileItemRegexes(params);
    const items = await this.getAllItems(config);

    return items.filter((item) => {
      if (regex.classRegex && !regex.classRegex.test(item._class)) return false;
      if (regex.fullNameRegex && !regex.fullNameRegex.test(item.fullName)) return false;
      if (regex.colorRegex) {
        if (!item.color) return false;
        if (!regex.colorRegex.test(item.color)) return false;
      }
      return true;
    });
  }

  /**
   * Trigger a build for a job and return the queue item id.
   * @param {string} fullName - Job full name.
   * @param {Record<string, string>} [parameters] - Build parameters.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<number>} Queue item id.
   */
  async buildItem(
    fullName: string,
    parameters?: Record<string, string>,
    config: AxiosRequestConfig = {}
  ): Promise<number> {
    const endpoint = buildTriggerPath(fullName, Boolean(parameters));
    const requestConfig = await this.applyCrumbHeaders({
      ...config,
      params: parameters,
    });

    const response = await this.client.post(endpoint, parameters || {}, requestConfig);
    const location = response.headers?.location;

    if (!location) {
      throw new Error(
        'Jenkins did not return a queue location (Location header missing) for build request.'
      );
    }

    return parseQueueIdFromLocation(location);
  }

  private async applyCrumbHeaders(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (!this.addCrumbHeaders) return config;
    return await this.addCrumbHeaders(config);
  }
}

function compileItemRegexes(params: QueryItemsParams): {
  classRegex: RegExp | null;
  fullNameRegex: RegExp | null;
  colorRegex: RegExp | null;
} {
  let classRegex: RegExp | null = null;
  let fullNameRegex: RegExp | null = null;
  let colorRegex: RegExp | null = null;

  try {
    if (params.classPattern) classRegex = new RegExp(params.classPattern);
    if (params.fullNamePattern) fullNameRegex = new RegExp(params.fullNamePattern);
    if (params.colorPattern) colorRegex = new RegExp(params.colorPattern);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid regex pattern';
    throw new Error(`Invalid regex pattern: ${message}`);
  }

  return { classRegex, fullNameRegex, colorRegex };
}

function parseQueueIdFromLocation(location: string): number {
  const idSegment = location.split('/').slice(-2, -1)[0];
  const queueId = Number.parseInt(idSegment, 10);

  if (Number.isNaN(queueId) || !Number.isInteger(queueId) || queueId < 0) {
    throw new Error(`Jenkins returned an invalid queue id in Location header: "${location}".`);
  }

  return queueId;
}
