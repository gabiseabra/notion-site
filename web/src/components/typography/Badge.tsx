import * as zn from "@notion-site/common/dto/notion/schema.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { CSSProperties, ReactNode } from "react";
import styles from "./Badge.module.scss";

export type BadgeProps = {
  color: zn.color;
  size: "xs" | "s" | "m" | "l";
  status?: "empty" | "in-progress" | "complete";

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Badge({
  color,
  size,
  status,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        className,
        styles.badge,
        styles[`size-${size}`],
        styles[`color-${color}`],
        status && styles[`status-${status}`],
      ]
        .filter(isTruthy)
        .join(" ")}
      {...props}
    />
  );
}
