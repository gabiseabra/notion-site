export type Iso<S, A> = {
  view: (s: S) => A;
  review: (a: A) => S;
};

export const Iso = {};
