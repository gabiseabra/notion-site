import { ComponentProps, CSSProperties } from "react";
import css from "./FlexBox.module.scss";

export function Row({
  className = "",
  style = {},
  alignX,
  alignY,
  ...props
}: ComponentProps<"div"> & {
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
}) {
  return (
    <div
      className={`${className} ${css.Row}`}
      style={{ alignContent: alignY, justifyContent: alignX, ...style }}
      {...props}
    />
  );
}

export function Col({
  className = "",
  style = {},
  alignX,
  alignY,
  ...props
}: ComponentProps<"div"> & {
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
}) {
  return (
    <div
      className={`${className} ${css.Col}`}
      style={{ alignItems: alignX, justifyContent: alignY, ...style }}
      {...props}
    />
  );
}
