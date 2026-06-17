/**
 * Exclude keys from an object (e.g. password fields)
 */
export function exclude<T, Key extends keyof T>(
  obj: T,
  keys: Key[]
): Omit<T, Key> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
