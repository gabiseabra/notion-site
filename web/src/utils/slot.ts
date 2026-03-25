export type Slot<S, T, Args extends unknown[] = []> =
  | T
  | ((value: S, ...args: Args) => T);

export const Slot = {
  extract<S, T, Args extends unknown[] = []>(
    slot: Slot<S, T, Args>,
    value: S,
    ...args: Args
  ) {
    if (slot instanceof Function) return slot(value, ...args);
    return slot;
  },
};
