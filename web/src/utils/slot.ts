import { isTruthy } from "@notion-site/common/utils/guards.js";

export type Slot<T, S = void, Args extends unknown[] = []> =
  | T
  | ((value: S, ...args: Args) => T);

export const Slot = {
  extract<T, S, Args extends unknown[]>(
    slot: Slot<T, S, Args>,
    value: S,
    ...args: Args
  ) {
    if (slot instanceof Function) return slot(value, ...args);
    return slot;
  },

  map<A, B, S, Args extends unknown[]>(
    slot: Slot<A, S, Args>,
    f: (a: A, ...args: Args) => B,
  ): Slot<B, S, Args> {
    return (s, ...args) => f(Slot.extract(slot, s, ...args), ...args);
  },

  compose<A, B, S, Args extends unknown[]>(
    first: Slot<A, S, Args>,
    second: Slot<B, A, Args>,
  ): Slot<B, S, Args> {
    return (s, ...args) =>
      Slot.extract(second, Slot.extract(first, s, ...args), ...args);
  },

  join<A, S, Args extends unknown[]>(
    slots: Slot<A, S, Args>[],
    f: (as: A[]) => A,
  ): Slot<A, S, Args> {
    return (s, ...args) =>
      f(slots.map((slot) => Slot.extract(slot, s, ...args)));
  },

  every<S, Args extends unknown[]>(slots: Slot<boolean, S, Args>[]) {
    return Slot.join(slots, (as) => as.every(isTruthy));
  },

  some<S, Args extends unknown[]>(slots: Slot<boolean, S, Args>[]) {
    return Slot.join(slots, (as) => as.some(isTruthy));
  },
};
