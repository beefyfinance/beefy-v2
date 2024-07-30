export function envBoolean(key: string, defaultValue: boolean): boolean {
  if (!(key in process.env)) {
    return defaultValue;
  }

  const value = process.env[key];
  if (!value || value.length === 0) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true' || value === '1';
}
