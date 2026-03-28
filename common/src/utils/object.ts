import { GenericObject } from "../types/object.js";
import { DistributiveOmit } from "../types/union.js";

export function omit<T extends object, const K extends (keyof T)[]>(
  obj: T,
  keys: K,
): DistributiveOmit<T, K[number]>;
export function omit<T extends object, const K extends (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const out = { ...obj };

  for (const k of keys) {
    delete out[k];
  }

  return out;
}

export function omitUndefined<T>(object: Partial<T>): Partial<T> {
  const out: Partial<T> = {};

  for (const key in object) {
    if (typeof object[key] !== "undefined") {
      out[key] = object[key];
    }
  }

  return out;
}

export function keys<T extends GenericObject>(object: T): (keyof T)[] {
  return Object.keys(object);
}

export function equals<T extends GenericObject>(
  a: T,
  b: T,
  eq: (a: T[keyof T], b: T[keyof T]) => boolean = (a, b) => a === b,
): boolean {
  const keysA = Object.keys(a) as (keyof T)[];
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((key) => key in b && eq(a[key], b[key]));
}
