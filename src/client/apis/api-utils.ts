import type { AxiosRequestConfig } from 'axios';

/**
 * Helper to apply CSRF crumb headers when provided.
 * @param {AxiosRequestConfig} config - Base Axios config.
 * @param {(config?: AxiosRequestConfig) => Promise<AxiosRequestConfig>} [addCrumbHeaders] - Optional crumb helper.
 * @returns {Promise<AxiosRequestConfig>} Config with crumb headers applied when available.
 */
export async function applyCrumbHeaders(
  config: AxiosRequestConfig,
  addCrumbHeaders?: (config?: AxiosRequestConfig) => Promise<AxiosRequestConfig>
): Promise<AxiosRequestConfig> {
  if (!addCrumbHeaders) return config;
  return await addCrumbHeaders(config);
}

/**
 * Merge an Accept header into an Axios config while preserving existing headers.
 * @param {AxiosRequestConfig} config - Base Axios config.
 * @param {string} accept - Accept header value.
 * @returns {AxiosRequestConfig} Config with merged Accept header.
 */
export function withAcceptHeader(config: AxiosRequestConfig, accept: string): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      Accept: accept,
      ...(config.headers ?? {}),
    },
  };
}

/**
 * Unwrap a list payload safely, defaulting to an empty array.
 * @template T
 * @param {T[] | undefined | null} value - Raw list value.
 * @returns {T[]} Normalized list.
 */
export function unwrapList<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}
