/**
 * Minimal structured logger that writes to stderr.
 * Target runtime: Node.js (ESM).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

/**
 * Create a structured logger instance.
 * @param {string} component - Component name to include in log entries.
 * @returns {Logger} Logger instance writing to stderr.
 */
export function createLogger(component: string): Logger {
  const write = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const entry = {
      ts: new Date().toISOString(),
      level,
      component,
      message,
      ...(meta ? { meta } : {}),
    };

    // Always write to stderr to avoid interfering with MCP stdout.
    process.stderr.write(`${JSON.stringify(entry)}\n`);
  };

  return {
    debug: (message, meta) => write('debug', message, meta),
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
  };
}
