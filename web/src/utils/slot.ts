import { ReactNode } from "react";

export type Slot<T> = ReactNode | ((value: T) => ReactNode);

export function renderSlot<T>(value: T, slot: Slot<T>) {
  if (slot instanceof Function) return slot(value);
  return slot;
}
