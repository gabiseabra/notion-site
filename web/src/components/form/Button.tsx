import { ComponentProps } from "react";
import styles from "./Button.module.scss";

export function Button({
  className = "",
  variant = "neutral",
  ...props
}: ComponentProps<"button"> & {
  variant?: "plain" | "neutral" | "primary" | "secondary";
}) {
  return (
    <button
      className={[className, styles.button, styles[`variant-${variant}`]].join(
        " ",
      )}
      {...props}
    />
  );
}
