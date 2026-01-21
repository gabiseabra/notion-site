import * as zn from "@notion-site/common/dto/notion/schema.js";
import { ComponentProps } from "react";
import { Spinner } from "../feedback/Spinner.js";
import styles from "./Button.module.scss";

type ButtonProps = {
  variant?: "plain" | "solid";
  color?: zn.color | "primary" | "secondary";
  loading?: boolean;
} & ComponentProps<"button">;

export function Button({
  className = "",
  variant = "solid",
  color = "default",
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={[
        className,
        styles.button,
        styles[`variant-${variant}`],
        styles[`color-${color}`],
      ].join(" ")}
      {...props}
    >
      {loading ? <Spinner size="s" /> : children}
    </button>
  );
}
