import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { omit } from "@notion-site/common/utils/object.js";
import { CSSProperties, ReactNode } from "react";
import { match } from "ts-pattern";
import * as css from "../../css/index.js";
import { MarginProps, PaddingProps } from "../../css/index.js";
import styles from "./Icon.module.scss";

type IconProps = {
  size: IconControlProps["size"];
  icon: zNotion.media.icon;
  className?: string;
  style?: CSSProperties;
};

/**
 * Renders a Notion icon.
 * @direction inline
 */
export function Icon({ icon, size, ...props }: IconProps) {
  return (
    <IconControl as="span" color="currentColor" size={size} {...props}>
      {match(icon)
        .with({ type: "emoji" }, (icon) => icon.emoji)
        .with({ type: "custom_emoji" }, (icon) => (
          <img loading="lazy" src={icon.custom_emoji.url} />
        ))
        .with({ type: "external" }, (icon) => (
          <img loading="lazy" src={icon.external.url} />
        ))
        .with({ type: "file" }, (icon) => (
          <img loading="lazy" src={icon.file.url} />
        ))
        .exhaustive()}
    </IconControl>
  );
}

export type IconControlProps = {
  as: "div" | "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l" | "xl" | "auto";
  color: zNotion.primitives.color | "primary" | "secondary" | "currentColor";

  badge?: string;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;

  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
} & PaddingProps &
  MarginProps;

/**
 * @direction inline
 */
export function IconControl({
  as: Component,
  size,
  color,
  badge,
  children,
  className,
  style,
  disabled,
  readOnly,
  onClick,
  ...props
}: IconControlProps) {
  // apply PX size inline for RSS feed
  const pxSize = {
    xs: 14,
    s: 18,
    m: 24,
    l: 32,
    xl: 64,
    auto: undefined,
  }[size];

  return (
    <Component
      className={[
        className,
        styles.icon,
        styles[`size-${size}`],
        color && styles[`color-${color}`],
        disabled && styles[`color-gray`],
        onClick && !disabled && !readOnly && styles.clickable,
      ]
        .filter(isTruthy)
        .join(" ")}
      style={{
        display: "inline-block",
        width: pxSize,
        ...style,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
      }}
      onClick={disabled || readOnly ? undefined : () => onClick?.()}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    >
      {children}

      {!!badge && <span className={styles.badge}>{badge}</span>}
    </Component>
  );
}
