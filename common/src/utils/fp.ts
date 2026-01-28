/**
 * Curry a function by moving its first argument to the end.
 * Useful for partial application with pipe.
 */
export const curry =
  <A, B, Args extends unknown[]>(fn: (a: A, ...args: Args) => B) =>
  (...args: Args) =>
  (a: A) =>
    fn(a, ...args);

/**
 * Lift a function into an async context by awaiting its first argument.
 */
export const liftM =
  <A, B, Args extends unknown[]>(fn: (a: A, ...args: Args) => B | Promise<B>) =>
  async (a: A | Promise<A>, ...args: Args): Promise<B> =>
    fn(await a, ...args);
