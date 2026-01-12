import * as n from "@notion-site/common/dto/notion/schema.js";
import { ReactNode } from "react";
import styles from "./Badge.module.scss";

type BadgeProps = {
  color: n.color;
  children: ReactNode;
};

export function Badge({ color, children }: BadgeProps) {
  return (
    <span className={[styles.Badge, `color-${color}`].join(" ")}>
      {children}
    </span>
  );
}
