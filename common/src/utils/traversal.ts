import { Lens } from "./lens.js";
import { Prism } from "./prism.js";

/** Focuses on 0-to-many parts `A` within a structure `S`. */
export type Traversal<S, A> = {
  get: (s: S) => A[];
  modify: (s: S, f: (a: A) => A) => S;
};

export const Traversal = {
  /** Focus on every element of an array. */
  each<A>(): Traversal<A[], A> {
    return {
      get: (s) => s,
      modify: (s, f) => s.map(f),
    };
  },

  /** Focus on a property of each element in an array. */
  fromProp<S, K extends keyof S>(key: K): Traversal<S[], S[K]> {
    return {
      get: (s) => s.map((el) => el[key]),
      modify: (s, f) => s.map((el) => ({ ...el, [key]: f(el[key]) })),
    };
  },

  /** Widen a Lens into a Traversal (always exactly 1 focus). */
  fromLens<S, A>(lens: Lens<S, A>): Traversal<S, A> {
    return {
      get: (s) => [lens.get(s)],
      modify: (s, f) => lens.set(s, f(lens.get(s))),
    };
  },

  /** Widen a Prism into a Traversal (0 or 1 focus). */
  fromPrism<S, A>(prism: Prism<S, A>): Traversal<S, A> {
    return {
      get: (s) => {
        const a = prism.get(s);
        return a !== undefined ? [a] : [];
      },
      modify: (s, f) => {
        const a = prism.get(s);
        return a !== undefined ? prism.set(s, f(a)) : s;
      },
    };
  },

  /** Compose two traversals: focus on `B` inside `A` inside `S`. */
  compose<S, A, B>(
    outer: Traversal<S, A>,
    inner: Traversal<A, B>,
  ): Traversal<S, B> {
    return {
      get: (s) => outer.get(s).flatMap(inner.get),
      modify: (s, f) => outer.modify(s, (a) => inner.modify(a, f)),
    };
  },

  /** Compose a traversal with a prism. */
  composePrism<S, A, B>(
    traversal: Traversal<S, A>,
    prism: Prism<A, B>,
  ): Traversal<S, B> {
    return Traversal.compose(traversal, Traversal.fromPrism(prism));
  },

  /** Compose a traversal with a lens. */
  composeLens<S, A, B>(
    traversal: Traversal<S, A>,
    lens: Lens<A, B>,
  ): Traversal<S, B> {
    return Traversal.compose(traversal, Traversal.fromLens(lens));
  },

  /** Set all foci to a constant value. */
  set<S, A>(traversal: Traversal<S, A>, s: S, a: A): S {
    return traversal.modify(s, () => a);
  },

  /** Reduce over all foci. */
  fold<S, A, B>(
    traversal: Traversal<S, A>,
    s: S,
    init: B,
    f: (acc: B, a: A) => B,
  ): B {
    return traversal.get(s).reduce(f, init);
  },
};
