import type { AxiosRequestConfig } from 'axios';
import type { JenkinsBuild, JenkinsItem } from '../../types/jenkins.js';
import type { JenkinsHttpClient } from '../http-client.js';
import { buildConsolePath, buildPath, stopBuildPath } from '../paths.js';

/**
 * Options for Builds API helpers.
 */
export interface BuildsApiOptions {
  /**
   * Optional helper to add CSRF crumb headers.
   * When provided, it is applied to write operations.
   */
  addCrumbHeaders?: (config?: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
}

/**
 * Wrapper around Jenkins build APIs.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class BuildsApi {
  private readonly client: JenkinsHttpClient;
  private readonly addCrumbHeaders?: BuildsApiOptions['addCrumbHeaders'];

  constructor(client: JenkinsHttpClient, options: BuildsApiOptions = {}) {
    this.client = client;
    this.addCrumbHeaders = options.addCrumbHeaders;
  }

  /**
   * Get specific build details.
   * @param {string} fullName - Job full name.
   * @param {number} buildNumber - Build number.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsBuild>} Build details.
   */
  async getBuild(
    fullName: string,
    buildNumber: number,
    config: AxiosRequestConfig = {}
  ): Promise<JenkinsBuild> {
    const response = await this.client.get<JenkinsBuild>(
      `${buildPath(fullName, buildNumber)}/api/json`,
      config
    );
    return response.data;
  }

  /**
   * Get build console output.
   * @param {string} fullName - Job full name.
   * @param {number} buildNumber - Build number.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<string>} Console output text.
   */
  async getBuildConsoleOutput(
    fullName: string,
    buildNumber: number,
    config: AxiosRequestConfig = {}
  ): Promise<string> {
    const response = await this.client.get<string>(buildConsolePath(fullName, buildNumber), {
      ...config,
      headers: {
        Accept: 'text/plain',
        ...(config.headers ?? {}),
      },
    });
    return response.data;
  }

  /**
   * Get all running builds (based on jobs' lastBuild).
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<JenkinsBuild[]>} Running builds.
   */
  async getRunningBuilds(config: AxiosRequestConfig = {}): Promise<JenkinsBuild[]> {
    const response = await this.client.get<{ jobs?: JenkinsItem[] }>(
      '/api/json?tree=jobs[fullName,lastBuild[number,url,building,timestamp,duration]]',
      config
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
   * Stop a running build.
   * @param {string} fullName - Job full name.
   * @param {number} buildNumber - Build number.
   * @param {AxiosRequestConfig} [config] - Optional Axios config overrides.
   * @returns {Promise<void>} Resolves when stopped.
   */
  async stopBuild(
    fullName: string,
    buildNumber: number,
    config: AxiosRequestConfig = {}
  ): Promise<void> {
    const requestConfig = await this.applyCrumbHeaders(config);
    await this.client.post(stopBuildPath(fullName, buildNumber), {}, requestConfig);
  }

  private async applyCrumbHeaders(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    if (!this.addCrumbHeaders) return config;
    return await this.addCrumbHeaders(config);
  }
}
