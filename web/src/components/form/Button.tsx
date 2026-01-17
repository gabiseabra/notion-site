import { ComponentProps, ReactNode } from "react";
import * as zn from "@notion-site/common/dto/notion/schema.js";
import styles from "./Button.module.scss";

export function Button({
  className = "",
  variant = "solid",
  color = "default",
  icon,
  children,
  ...props
}: ComponentProps<"button"> & {
  icon?: ReactNode;
  variant?: "plain" | "solid";
  color?: zn.color | "primary" | "secondary";
}) {
  return (
    <button
      className={[
        className,
        styles.button,
        styles[`variant-${variant}`],
        styles[`color-${color}`],
      ].join(" ")}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}

      {children}
    </button>
  );
}
