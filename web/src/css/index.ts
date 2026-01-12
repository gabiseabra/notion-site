/**
 * @module css/index.js
 * Helper functions to handle css vars in js world
 */

export const _space = "var(--space)";

export const space = (n: number) => `calc(${_space} * ${n})`;
