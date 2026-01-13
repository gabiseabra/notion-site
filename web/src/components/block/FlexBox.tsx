import { ComponentProps, CSSProperties } from "react";
import styles from "./FlexBox.module.scss";
import * as css from "../../css/index.js";
import { omit } from "@notion-site/common/utils/object.js";

export type RowProps = {
  as?: "div" | "section";
  gap?: number;
  wrap?: boolean;
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
} & PaddingProps &
  MarginProps &
  ComponentProps<"div">;

export function Row({
  as: Component = "div",
  style = {},
  gap,
  wrap,
  alignX,
  alignY,
  className = "",
  ...props
}: RowProps) {
  return (
    <Component
      className={`${className} ${styles.row}`}
      style={{
        alignItems: alignY,
        justifyContent: alignX,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        ...getPaddingStyles(props),
        ...getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...paddingProps, ...marginProps])}
    />
  );
}

export type ColProps = {
  as?: "div" | "section" | "header";
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  gap?: number;
} & PaddingProps &
  MarginProps &
  ComponentProps<"div">;

export function Col({
  as: Component = "div",
  gap,
  alignX,
  alignY,
  className = "",
  style = {},
  ...props
}: ColProps) {
  return (
    <Component
      className={`${className} ${styles.col}`}
      style={{
        alignItems: alignX,
        justifyContent: alignY,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        ...getPaddingStyles(props),
        ...getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...paddingProps, ...marginProps])}
    />
  );
}

const paddingProps = ["p", "pt", "pl", "pr", "pb", "px", "py"] as const;
type PaddingProps = { [k in (typeof paddingProps)[number]]?: number };

function getPaddingStyles(props: PaddingProps) {
  return {
    padding: typeof props.p === "number" ? css.space(props.p) : undefined,
    paddingTop: typeof props.pt === "number" ? css.space(props.pt) : undefined,
    paddingBottom:
      typeof props.pb === "number" ? css.space(props.pb) : undefined,
    paddingLeft: typeof props.pl === "number" ? css.space(props.pl) : undefined,
    paddingRight:
      typeof props.pr === "number" ? css.space(props.pr) : undefined,
    paddingBlock:
      typeof props.py === "number" ? css.space(props.py) : undefined,
    paddingInline:
      typeof props.px === "number" ? css.space(props.px) : undefined,
  } satisfies CSSProperties;
}

const marginProps = ["m", "mt", "ml", "mr", "mb", "mx", "my"] as const;
type MarginProps = { [k in (typeof marginProps)[number]]?: number };

function getMarginStyles(props: MarginProps) {
  return {
    margin: typeof props.m === "number" ? css.space(props.m) : undefined,
    marginTop: typeof props.mt === "number" ? css.space(props.mt) : undefined,
    marginBottom:
      typeof props.mb === "number" ? css.space(props.mb) : undefined,
    marginLeft: typeof props.ml === "number" ? css.space(props.ml) : undefined,
    marginRight: typeof props.mr === "number" ? css.space(props.mr) : undefined,
    marginBlock: typeof props.my === "number" ? css.space(props.my) : undefined,
    marginInline:
      typeof props.mx === "number" ? css.space(props.mx) : undefined,
  } satisfies CSSProperties;
}
