import { ComponentProps, CSSProperties } from "react";
import css from "./FlexBox.module.scss";

export function Row({
  as: Component = "div",
  className = "",
  style = {},
  alignX,
  alignY,
  gap,
  ...props
}: ComponentProps<"div"> & {
  as?: "div" | "section";
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
  gap?: number;
}) {
  return (
    <Component
      className={`${className} ${css.Row}`}
      style={{
        alignItems: alignY,
        justifyContent: alignX,
        gap:
          typeof gap === "number" ? `calc(var(--space) * ${gap})` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export function Col({
  as: Component = "div",
  className = "",
  style = {},
  alignX,
  alignY,
  gap,
  ...props
}: ComponentProps<"div"> & {
  as?: "div" | "section";
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  gap?: number;
}) {
  return (
    <Component
      className={`${className} ${css.Col}`}
      style={{
        alignItems: alignX,
        justifyContent: alignY,
        gap:
          typeof gap === "number" ? `calc(var(--space) * ${gap})` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
