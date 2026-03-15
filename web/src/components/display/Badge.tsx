import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Status } from "@notion-site/common/dto/primitives.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { CSSProperties, ReactNode } from "react";
import styles from "./Badge.module.scss";

export type BadgeProps = {
  color: zNotion.primitives.color;
  size: "xs" | "s" | "m" | "l";
  status?: Status;
  active?: boolean;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * @direction inline
 */
export function Badge({
  color,
  size,
  status,
  active,
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
        active && styles.active,
      ]
        .filter(isTruthy)
        .join(" ")}
      {...props}
    />
  );
}
