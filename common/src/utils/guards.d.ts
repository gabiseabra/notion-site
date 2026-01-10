export declare function isNonNullable<T>(value: T): value is NonNullable<T>;
export declare function hasNonNullableProperty<T, K extends keyof T>(key: K): (obj: T) => obj is T & { [key in K]: NonNullable<T[K]>; };
/**
 * Assertion function that checks whether some key has some value.
 * Handy for filtering lists of discriminated unions, as lambdas do not automatically narrow the type.
 *
 * @example
 * declare const labour: (FixedPriceLabour | HourlyLabour)[];
 * const fixedPriceLabour = labour.filter(hasPropertyValue('type', 'fixed-price-labour')) // typeof fixedPriceLabour = FixedPriceLabour[]
 */
export declare function hasPropertyValue<const T, const K extends keyof T, const V extends T[K]>(key: K, value: V): (obj: T) => obj is T & { [key in K]: V; };
