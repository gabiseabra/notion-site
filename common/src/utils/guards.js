export function isNonNullable(value) {
    return value !== null && value !== undefined;
}
export function hasNonNullableProperty(key) {
    return (obj) => isNonNullable(obj[key]);
}
/**
 * Assertion function that checks whether some key has some value.
 * Handy for filtering lists of discriminated unions, as lambdas do not automatically narrow the type.
 *
 * @example
 * declare const labour: (FixedPriceLabour | HourlyLabour)[];
 * const fixedPriceLabour = labour.filter(hasPropertyValue('type', 'fixed-price-labour')) // typeof fixedPriceLabour = FixedPriceLabour[]
 */
export function hasPropertyValue(key, value) {
    return (obj) => obj[key] === value;
}
//# sourceMappingURL=guards.js.map