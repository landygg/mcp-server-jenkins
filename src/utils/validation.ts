/**
 * Shared validation helpers.
 * Target runtime: Node.js (ESM).
 */

export function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} is required and must be a non-empty string`);
  }
}

export function assertPositiveInt(value: unknown, label: string): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

export function assertNonNegativeInt(value: unknown, label: string): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}

export function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Parse a positive integer from a string with fallback.
 * @param {string | undefined} value - Raw string value.
 * @param {number} fallback - Default value when not provided.
 * @param {string} label - Name for error messages.
 * @returns {number} Validated positive integer.
 * @throws {Error} If provided value is not a positive integer.
 */
export function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  label: string
): number {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer (seconds)`);
  }

  return parsed;
}
