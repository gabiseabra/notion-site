import * as n from "@notion-site/common/dto/notion/schema.js";
import { ReactNode } from "react";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import styles from "./Badge.module.scss";

type BadgeProps = {
  color: n.color;
  status?: "empty" | "in-progress" | "complete";
  children: ReactNode;
};

export function Badge({ color, status, children }: BadgeProps) {
  return (
    <span
      className={[
        styles.Badge,
        styles[`Color-${color}`],
        status && styles[`Status-${status}`],
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}
