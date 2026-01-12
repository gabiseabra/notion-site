import { ComponentProps, CSSProperties } from "react";
import styles from "./FlexBox.module.scss";
import * as css from "../../css/index.js";

export type RowProps = ComponentProps<"div"> & {
  as?: "div" | "section";
  gap?: number;
  wrap?: boolean;
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
};

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
        ...style,
      }}
      {...props}
    />
  );
}

export type ColProps = ComponentProps<"div"> & {
  as?: "div" | "section" | "header";
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  gap?: number;
};

export function Col({
  as: Component = "div",
  className = "",
  style = {},
  alignX,
  alignY,
  gap,
  ...props
}: ColProps) {
  return (
    <Component
      className={`${className} ${styles.col}`}
      style={{
        alignItems: alignX,
        justifyContent: alignY,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
