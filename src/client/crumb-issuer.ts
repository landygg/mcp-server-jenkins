import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

/**
 * Jenkins CSRF crumb representation.
 */
export interface JenkinsCrumb {
  crumb: string;
  field: string;
}

/**
 * Logger interface for crumb issuer diagnostics.
 */
export interface CrumbLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Options for the crumb issuer helper.
 */
export interface CrumbIssuerOptions {
  /**
   * Optional time-to-live for cached crumbs, in milliseconds.
   * If not provided, the crumb is cached indefinitely until reset.
   */
  cacheTtlMs?: number;
  /**
   * Optional logger for diagnostics.
   */
  logger?: CrumbLogger;
}

interface CachedCrumb {
  value: JenkinsCrumb | null;
  cachedAt: number;
}

/**
 * Create a helper for managing Jenkins CSRF crumbs.
 *
 * Target runtime: Node.js (ESM).
 * Async pattern: async/await.
 */
export function createCrumbIssuer(client: AxiosInstance, options: CrumbIssuerOptions = {}) {
  const { cacheTtlMs, logger } = options;
  let cached: CachedCrumb | undefined;

  const isExpired = (entry: CachedCrumb): boolean => {
    if (!cacheTtlMs) return false;
    return Date.now() - entry.cachedAt > cacheTtlMs;
  };

  const getCached = (): JenkinsCrumb | null | undefined => {
    if (!cached) return undefined;
    if (isExpired(cached)) return undefined;
    return cached.value;
  };

  const setCached = (value: JenkinsCrumb | null): void => {
    cached = { value, cachedAt: Date.now() };
  };

  /**
   * Fetch a Jenkins crumb (if CSRF protection is enabled).
   * Results are cached; null is cached when CSRF is not enabled.
   */
  const getCrumb = async (): Promise<JenkinsCrumb | null> => {
    const existing = getCached();
    if (existing !== undefined) return existing;

    try {
      const response = await client.get('/crumbIssuer/api/json');
      const crumb = {
        crumb: response.data.crumb,
        field: response.data.crumbRequestField,
      } as JenkinsCrumb;
      setCached(crumb);
      return crumb;
    } catch (error) {
      setCached(null);
      if (axios.isAxiosError(error)) {
        logger?.warn('Failed to fetch Jenkins crumb (CSRF may be disabled).', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          code: error.code,
          message: error.message,
        });
      } else {
        const message = error instanceof Error ? error.message : String(error);
        logger?.warn('Failed to fetch Jenkins crumb (CSRF may be disabled).', {
          message,
        });
      }
      return null;
    }
  };

  /**
   * Add crumb header to the provided Axios request config, if available.
   */
  const addCrumbHeaders = async (config: AxiosRequestConfig = {}): Promise<AxiosRequestConfig> => {
    const crumb = await getCrumb();
    if (!crumb) return config;

    return {
      ...config,
      headers: {
        ...config.headers,
        [crumb.field]: crumb.crumb,
      },
    };
  };

  /**
   * Clear cached crumb and reset state.
   */
  const reset = (): void => {
    cached = undefined;
  };

  return {
    getCrumb,
    addCrumbHeaders,
    reset,
  };
}

/**
 * Crumb issuer instance type for reuse.
 */
export type CrumbIssuer = ReturnType<typeof createCrumbIssuer>;
