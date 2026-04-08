/** Focuses on a part `A` of a larger structure `S` that may not exist. */
export type Prism<S, A> = {
  get: (s: S) => A | undefined;
  set: (s: S, a: A) => S;
  // review: (a: A) => S;
};

export const Prism = {
  /** Create a prism from a type guard. */
  fromGuard<S, A extends S>(guard: (s: S) => s is A): Prism<S, A> {
    return {
      get: (s) => (guard(s) ? s : undefined),
      set: (_, a) => a,
      // review: (a) => a,
    };
  },

  /** Compose two prisms: focus on `B` inside `A` inside `S`. */
  compose<S, A, B>(outer: Prism<S, A>, inner: Prism<A, B>): Prism<S, B> {
    return {
      get: (s) => {
        const a = outer.get(s);
        return a !== undefined ? inner.get(a) : undefined;
      },
      set: (s, b) => {
        const a = outer.get(s);
        return a !== undefined ? outer.set(s, inner.set(a, b)) : s;
      },
      // review: (b) => outer.review(inner.review(b)),
    };
  },

  /** Apply a function to the focused value. Returns `s` unchanged if no match. */
  modify<S, A>(prism: Prism<S, A>, s: S, f: (a: A) => A): S {
    const a = prism.get(s);
    return a !== undefined ? prism.set(s, f(a)) : s;
  },

  /** Check whether the prism matches. */
  has<S, A>(prism: Prism<S, A>, s: S): boolean {
    return prism.get(s) !== undefined;
  },

  /** Get the focused value or a fallback. */
  fold<S, A>(prism: Prism<S, A>, s: S, fallback: A): A {
    return prism.get(s) ?? fallback;
  },
};
