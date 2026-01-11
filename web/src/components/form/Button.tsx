import { ComponentProps } from "react";
import css from "./Button.module.scss";

export function Button({
  className = "",
  variant = "neutral",
  ...props
}: ComponentProps<"button"> & {
  variant?: "plain" | "neutral" | "primary" | "secondary";
}) {
  return (
    <button
      className={[className, css.Button, `variant-${variant}`].join(" ")}
      {...props}
    />
  );
}
