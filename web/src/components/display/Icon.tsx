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
};

/**
 * Renders a Notion icon.
 * @direction inline
 */
export function Icon({ icon, size }: IconProps) {
  return (
    <IconControl as="span" color="currentColor" size={size}>
      {match(icon)
        .with({ type: "emoji" }, (icon) => icon.emoji)
        .with({ type: "custom_emoji" }, (icon) => (
          <img src={icon.custom_emoji.url} />
        ))
        .with({ type: "external" }, (icon) => <img src={icon.external.url} />)
        .with({ type: "file" }, (icon) => <img src={icon.file.url} />)
        .exhaustive()}
    </IconControl>
  );
}

export type IconControlProps = {
  as: "div" | "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l";
  color: zNotion.primitives.color | "primary" | "secondary" | "currentColor";

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
export function IconControl({
  as: Component,
  size,
  color,
  badge,
  children,
  className,
  style,
  onClick,
  ...props
}: IconControlProps) {
  return (
    <Component
      className={[
        className,
        styles.icon,
        styles[`size-${size}`],
        color && styles[`color-${color}`],
        onClick && styles.clickable,
      ]
        .filter(isTruthy)
        .join(" ")}
      style={{
        ...style,
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
