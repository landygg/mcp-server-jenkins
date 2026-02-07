import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';
import type { JenkinsConfig } from '../types/jenkins.js';

/**
 * Structured logger used by the HTTP client.
 */
export interface HttpClientLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Options to customize the Jenkins HTTP client.
 */
export interface HttpClientOptions {
  /**
   * Override request timeout in milliseconds.
   * Defaults to JenkinsConfig.timeout (seconds) when provided.
   */
  timeoutMs?: number;
  /**
   * Enable/disable keep-alive and socket pooling.
   */
  keepAlive?: boolean;
  /**
   * Maximum sockets for the HTTP(S) agent pool.
   */
  maxSockets?: number;
  /**
   * Optional default headers applied to all requests.
   */
  defaultHeaders?: Record<string, string>;
  /**
   * Optional logger for diagnostic output.
   */
  logger?: HttpClientLogger;
}

/**
 * HTTP client wrapper for Jenkins requests.
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export class JenkinsHttpClient {
  private readonly client: AxiosInstance;
  private readonly logger?: HttpClientLogger;

  constructor(config: JenkinsConfig, options: HttpClientOptions = {}) {
    this.logger = options.logger;

    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.url,
      timeout: options.timeoutMs ?? (config.timeout || 5) * 1000,
      headers: {
        'Content-Type': 'application/json',
        ...options.defaultHeaders,
      },
      httpAgent: new http.Agent({
        keepAlive: options.keepAlive ?? true,
        maxSockets: options.maxSockets ?? 10,
      }),
      httpsAgent: new https.Agent({
        keepAlive: options.keepAlive ?? true,
        maxSockets: options.maxSockets ?? 10,
        rejectUnauthorized: config.verifySSL !== false,
      }),
    };

    if (config.username && config.password) {
      axiosConfig.auth = {
        username: config.username,
        password: config.password,
      };
    }

    // Respect explicit SSL verification override.
    if (config.verifySSL === false) {
      axiosConfig.httpsAgent = new https.Agent({
        keepAlive: options.keepAlive ?? true,
        maxSockets: options.maxSockets ?? 10,
        rejectUnauthorized: false,
      });
    }

    this.client = axios.create(axiosConfig);
  }

  /**
   * Low-level request helper. Throws on non-2xx responses.
   * @param {AxiosRequestConfig} config - Axios request config.
   * @returns {Promise<AxiosResponse<T>>} Axios response.
   */
  async request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.request<T>(config);
    } catch (error) {
      this.logAxiosError(error, config);
      throw error;
    }
  }

  /**
   * GET helper.
   * @param {string} url - Request URL (relative to baseURL).
   * @param {AxiosRequestConfig} [config] - Axios config overrides.
   */
  async get<T = unknown>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return await this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST helper.
   * @param {string} url - Request URL (relative to baseURL).
   * @param {unknown} data - Request body payload.
   * @param {AxiosRequestConfig} [config] - Axios config overrides.
   */
  async post<T = unknown>(
    url: string,
    data: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return await this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * Access the underlying Axios instance when needed.
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  private logAxiosError(error: unknown, config: AxiosRequestConfig): void {
    if (!this.logger) return;

    if (axios.isAxiosError(error)) {
      this.logger.error('Jenkins HTTP request failed', {
        method: config.method,
        url: config.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code,
        message: error.message,
      });
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    this.logger.error('Jenkins HTTP request failed', {
      method: config.method,
      url: config.url,
      message,
    });
  }
}
