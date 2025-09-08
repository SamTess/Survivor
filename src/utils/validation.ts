export function isNonEmptyString(v: unknown, max = 5000): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

export function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

export function parseIntParam(v: unknown): number | null {
  if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  return null;
}

export function assertTruthy(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
