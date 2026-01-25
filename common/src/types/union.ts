export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type UnionToTuple<U> =
  UnionToIntersection<U extends unknown ? (u: U) => void : never> extends (
    v: infer V,
  ) => void
    ? [...UnionToTuple<Exclude<U, V>>, V]
    : [];

/**
 * Distributive version of {@link Omit}.
 *
 * TypeScript’s built-in `Omit<T, K>` does not distribute over union types, which can
 * collapse discriminated unions down to only their shared fields. This helper forces
 * distribution by using a distributive conditional type, applying `Omit` to each union
 * member and then re-unioning the results.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
