/** Focuses on a part `A` of a larger structure `S` that may not exist. */
export type Optional<S, A> = {
  get: (s: S) => A | null;
  set: (s: S, a: A) => S;
};

export const Optional = {
  /** Focus on an array element matching a predicate. */
  find<A>(predicate: (a: A) => boolean): Optional<A[], A> {
    return {
      get: (s) => s.find(predicate) ?? null,
      set: (s, a) => s.map((item) => (predicate(item) ? a : item)),
    };
  },

  /** Focus on a nullable property of an object. */
  prop<S, K extends keyof S>(key: K): Optional<S, NonNullable<S[K]>> {
    return {
      get: (s) => (s[key] ?? null) as NonNullable<S[K]> | null,
      set: (s, a) => ({ ...s, [key]: a }),
    };
  },

  /** Compose two optionals: focus on `B` inside `A` inside `S`. */
  compose<S, A, B>(
    outer: Optional<S, A>,
    inner: Optional<A, B>,
  ): Optional<S, B> {
    return {
      get: (s) => {
        const a = outer.get(s);
        return a !== null ? inner.get(a) : null;
      },
      set: (s, b) => {
        const a = outer.get(s);
        return a !== null ? outer.set(s, inner.set(a, b)) : s;
      },
    };
  },

  /** Apply a function to the focused value if it exists; return `s` unchanged otherwise. */
  modify<S, A>(optional: Optional<S, A>, s: S, f: (a: A) => A): S {
    const a = optional.get(s);
    return a !== null ? optional.set(s, f(a)) : s;
  },
};
