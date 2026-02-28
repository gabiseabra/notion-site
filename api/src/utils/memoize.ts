import Keyv from "keyv";

export type MemoizeOptions<Args extends unknown[], Value> = {
  /**
   * Keyv cache instance. If omitted, a new in-memory Keyv instance is created.
   */
  cache?: Keyv<Value>;
  /**
   * Hash function to build a stable cache key from arguments.
   */
  hash: (...args: Args) => string;
  /**
   * Skip cache for a call.
   */
  skip?: (...args: Args) => boolean;
  /**
   * TTL in milliseconds.
   */
  ttl?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MemoizedFn<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

/**
 * Memoize an async/sync function using Keyv as the cache store.
 * Dedupe in-flight calls for the same key.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  options: MemoizeOptions<Parameters<F>, Awaited<ReturnType<F>>>,
): F;
export function memoize<Args extends unknown[], Value>(
  fn: (...args: Args) => Promise<Value>,
  { cache, hash, skip, ttl }: MemoizeOptions<Args, Value>,
) {
  const store = cache ?? new Keyv<Value>();
  const inflight = new Map<string, Promise<Value>>();

  return async (...args: Args) => {
    if (skip?.(...args)) {
      return await fn(...args);
    }

    const key = hash(...args);
    const cached = await store.get(key);
    if (cached !== undefined) return cached;

    const existing = inflight.get(key);
    if (existing) return existing;

    const run = Promise.resolve(fn(...args))
      .then(async (value) => {
        await store.set(key, value, ttl);
        return value;
      })
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, run);
    return run;
  };
}
