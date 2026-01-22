import * as zn from "@notion-site/common/dto/notion/schema.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { omit } from "@notion-site/common/utils/object.js";
import { CSSProperties, ReactNode } from "react";
import * as css from "../../css/index.js";
import { MarginProps, PaddingProps } from "../../css/index.js";
import styles from "./IconButton.module.scss";

export type IconButtonProps = {
  as: "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l";
  color?: zn.color | "primary" | "secondary";

  badge?: string;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;

  onClick?: () => void;
} & PaddingProps &
  MarginProps;

/**
 * @direction inline
 */
export function IconButton({
  as: Component,
  size,
  color,
  badge,
  children,
  className,
  style,
  onClick,
  ...props
}: IconButtonProps) {
  return (
    <Component
      className={[
        className,
        styles.icon,
        styles[`size-${size}`],
        styles[`color-${color}`],
        onClick && styles.clickable,
      ]
        .filter(isTruthy)
        .join(" ")}
      style={{
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
      }}
      onClick={() => onClick?.()}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    >
      {children}

      {!!badge && <span className={styles.badge}>{badge}</span>}
    </Component>
  );
}
