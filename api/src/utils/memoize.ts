import Keyv from "keyv";
import { z } from "zod";

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
   * Zod schema used to parse cached values.
   */
  schema?: (...args: Args) => z.ZodType<Value>;
};

/**
 * Memoize an async function using Keyv as the cache store.
 *
 * @note In-flight calls with the same key are deduped.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  options: MemoizeOptions<Parameters<F>, Awaited<ReturnType<F>>>,
): F;
export function memoize<Args extends unknown[], Value>(
  fn: (...args: Args) => Promise<Value>,
  { cache, hash, skip, schema }: MemoizeOptions<Args, Value>,
) {
  const store = cache ?? new Keyv<Value>();
  if (!cache) {
    store.serialize = undefined;
    store.deserialize = undefined;
  }
  const inflight = new Map<string, Promise<Value>>();

  return async (...args: Args) => {
    if (skip?.(...args)) {
      return await fn(...args);
    }

    const key = hash(...args);
    const cached = await store.get(key);
    if (cached !== undefined) {
      if (!schema) return cached;

      const parsed = schema(...args).safeParse(cached);
      if (parsed.success) return parsed.data;

      await store.delete(key);
    }

    const existing = inflight.get(key);
    if (existing) return existing;

    const run = Promise.resolve(fn(...args))
      .then(async (value) => {
        await store.set(key, value);
        return value;
      })
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, run);
    return run;
  };
}
