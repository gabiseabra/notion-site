import { omit } from "@notion-site/common/utils/object.js";
import { ComponentProps, CSSProperties } from "react";
import * as css from "../../css/index.js";
import styles from "./FlexBox.module.scss";

export type RowProps = {
  as?: "div" | "section";
  flex?: number | string;
  gap?: number;
  wrap?: boolean;
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
} & css.PaddingProps &
  css.MarginProps &
  ComponentProps<"div">;

export function Row({
  as: Component = "div",
  style = {},
  flex,
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
        flex,
        alignItems: alignY,
        justifyContent: alignX,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    />
  );
}

export type ColProps = {
  as?: "div" | "section" | "header";
  flex?: number | string;
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  gap?: number;
} & css.PaddingProps &
  css.MarginProps &
  ComponentProps<"div">;

export function Col({
  as: Component = "div",
  flex,
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
        flex,
        alignItems: alignX,
        justifyContent: alignY,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    />
  );
}
