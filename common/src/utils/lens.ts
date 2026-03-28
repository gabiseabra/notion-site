/** Focuses on a part `A` of a larger structure `S`. */
export type Lens<S, A> = {
  get: (s: S) => A;
  set: (s: S, a: A) => S;
};

export const Lens = {
  /** Focus on a single property of an object. */
  prop<S, K extends keyof S>(key: K): Lens<S, S[K]> {
    return {
      get: (s) => s[key],
      set: (s, a) => ({ ...s, [key]: a }),
    };
  },

  /** Compose two lenses: focus on `B` inside `A` inside `S`. */
  compose<S, A, B>(outer: Lens<S, A>, inner: Lens<A, B>): Lens<S, B> {
    return {
      get: (s) => inner.get(outer.get(s)),
      set: (s, b) => outer.set(s, inner.set(outer.get(s), b)),
    };
  },

  /** Apply a function to the focused value. */
  modify<S, A>(lens: Lens<S, A>, s: S, f: (a: A) => A): S {
    return lens.set(s, f(lens.get(s)));
  },
};
