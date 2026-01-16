import * as zN from "@notion-site/common/dto/notion/schema.js";
import { ReactNode } from "react";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import styles from "./Badge.module.scss";

type BadgeProps = {
  color: zN.color;
  size?: "s" | "m" | "l";
  status?: "empty" | "in-progress" | "complete";
  children: ReactNode;
};

export function Badge({ color, size, status, children }: BadgeProps) {
  return (
    <span
      className={[
        styles.badge,
        styles[`size-${size}`],
        styles[`color-${color}`],
        status && styles[`status-${status}`],
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}
