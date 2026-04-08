import { isTruthy } from "@notion-site/common/utils/guards.js";

export type Slot<T, S = void> = T | ((value: S) => T);

export const Slot = {
  extract<T, S>(slot: Slot<T, S>, value: S) {
    if (slot instanceof Function) return slot(value);
    return slot;
  },

  map<A, B, S>(slot: Slot<A, S>, f: (a: A) => B): Slot<B, S> {
    return (s) => f(Slot.extract(slot, s));
  },

  compose<A, B, S>(first: Slot<A, S>, second: Slot<B, A>): Slot<B, S> {
    return (s) => Slot.extract(second, Slot.extract(first, s));
  },

  join<A, S>(slots: Slot<A, S>[], f: (as: A[]) => A): Slot<A, S> {
    return (s) => f(slots.map((slot) => Slot.extract(slot, s)));
  },

  every<S>(slots: Slot<boolean, S>[]) {
    return Slot.join(slots, (as) => as.every(isTruthy));
  },

  some<S>(slots: Slot<boolean, S>[]) {
    return Slot.join(slots, (as) => as.some(isTruthy));
  },
};
