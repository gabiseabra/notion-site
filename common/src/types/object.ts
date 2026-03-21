export type EmptyObject = { [k: string]: never };

export type GenericObject = { [k: string]: unknown };

/**
 * Make some keys required while leaving the rest as they were.
 *
 * @example
 *   type T = { a?: number; b?: string; }
 *   type U = WithRequired<T, "a">  // => { a: number; b?: string }
 */
// export type WithRequired<T, K extends keyof T> = K extends keyof T
//   ? Required<Pick<T, K>> & Omit<T, K>
//   : never;
export type WithRequired<T, K extends keyof T> = [K] extends [keyof T]
  ? Required<Pick<T, K>> & Omit<T, K>
  : never;

// export type WithOptional<T, K extends keyof T> = K extends keyof T
//   ? Omit<T, K> & Partial<Pick<T, K>>
//   : never;
export type WithOptional<T, K extends keyof T> = [K] extends [keyof T]
  ? Partial<Pick<T, K>> & Omit<T, K>
  : never;
