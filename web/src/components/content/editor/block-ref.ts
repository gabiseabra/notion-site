import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { ID } from "./types";

export type BlockRef = {
  element: HTMLElement | null;
  children: Map<ID, HTMLElement>;
};

export const BlockRef = {
  entries(ref: BlockRef) {
    return [
      ref.element && ([undefined as ID | undefined, ref.element] as const),
      ...Array.from(ref.children.entries()),
    ].filter(isNonNullable);
  },
};
