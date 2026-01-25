/**
 * @module css/index.js
 * Helper functions to handle css vars in js world
 */
import { omitUndefined } from "@notion-site/common/utils/object.js";
import { CSSProperties } from "react";
import * as env from "../env.js";

export const _space = "var(--space)";

export const space = (n: number) => `calc(${_space} * ${n})`;

export const breakpoint = (size: "s" | "m") => `var(--breakpoint-${size})`;

export function computeProperty(variableOrProperty: string, element?: Element) {
  if (env.SSR) {
    return "";
  }

  return getComputedStyle(element ?? document.documentElement)
    .getPropertyValue(
      variableOrProperty.startsWith("var")
        ? variableOrProperty.slice(4, -1)
        : variableOrProperty,
    )
    .trim();
}

export function toPx(value: string, element?: Element): number {
  if (env.SSR) {
    return 0;
  }

  if (value.endsWith("px")) return parseFloat(value);

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = value;

  (element ?? document.documentElement).appendChild(probe);

  const px = probe.getBoundingClientRect().width;
  probe.remove();

  return px;
}

export const paddingProps = ["p", "pt", "pl", "pr", "pb", "px", "py"] as const;
export type PaddingProps = { [k in (typeof paddingProps)[number]]?: number };

export function getPaddingStyles(props: PaddingProps) {
  return omitUndefined({
    padding: typeof props.p === "number" ? space(props.p) : undefined,
    paddingTop: typeof props.pt === "number" ? space(props.pt) : undefined,
    paddingBottom: typeof props.pb === "number" ? space(props.pb) : undefined,
    paddingLeft: typeof props.pl === "number" ? space(props.pl) : undefined,
    paddingRight: typeof props.pr === "number" ? space(props.pr) : undefined,
    paddingBlock: typeof props.py === "number" ? space(props.py) : undefined,
    paddingInline: typeof props.px === "number" ? space(props.px) : undefined,
  }) satisfies CSSProperties;
}

export const marginProps = ["m", "mt", "ml", "mr", "mb", "mx", "my"] as const;
export type MarginProps = { [k in (typeof marginProps)[number]]?: number };

export function getMarginStyles(props: MarginProps) {
  return omitUndefined({
    margin: typeof props.m === "number" ? space(props.m) : undefined,
    marginTop: typeof props.mt === "number" ? space(props.mt) : undefined,
    marginBottom: typeof props.mb === "number" ? space(props.mb) : undefined,
    marginLeft: typeof props.ml === "number" ? space(props.ml) : undefined,
    marginRight: typeof props.mr === "number" ? space(props.mr) : undefined,
    marginBlock: typeof props.my === "number" ? space(props.my) : undefined,
    marginInline: typeof props.mx === "number" ? space(props.mx) : undefined,
  }) satisfies CSSProperties;
}
