import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { omit } from "@notion-site/common/utils/object.js";
import { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import * as css from "../../css/index.js";
import styles from "./Text.module.scss";

export type TextProps = {
  as: TextTag;
  size?: TextSize;
  color?: TextColor;
  indent?: number;
} & css.MarginProps &
  css.PaddingProps &
  HTMLAttributes<HTMLElement>;

type TextTag = "div" | "p" | "blockquote" | "h1" | "h2" | "h3" | "h4";

type TextColor =
  | zNotion.primitives.api_color
  | "primary"
  | "secondary"
  | "disabled"
  | "muted"
  | "link";

type TextSize = "caption" | "body" | "h1" | "h2" | "h3" | "h4";

/**
 * A block element meant for wrapping around text.
 * @direction block
 */
export function Text({
  as: Tag,
  size,
  color,
  indent,
  children,
  className,
  style = {},
  ...props
}: TextProps) {
  return (
    <Tag
      className={[
        indent && styles[`indent-${{ 1: 1, 2: 2, 3: 3, 4: 4 }[indent] ?? 0}`],
        size && styles[`size-${size}`],
        color && styles[`color-${color}`],
        className,
      ]
        .filter(isTruthy)
        .join(" ")}
      style={{
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    >
      {children}
    </Tag>
  );
}

export type Annotations = {
  size?: TextSize;
  color?: TextColor;
  redacted?: boolean;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
};
export type SpanProps = Annotations & ComponentPropsWithoutRef<"span">;

/**
 * An inline element for text with annotations.
 * @direction inline
 */
export function Span({ children, style, className, ...props }: SpanProps) {
  return (
    <span
      style={style}
      className={[className, Span.className(props)].filter(isTruthy).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

Span.className = ({
  bold,
  italic,
  underline,
  strikethrough,
  code,
  color,
  redacted,
  size,
}: Annotations) => {
  return [
    styles.span,
    bold && styles.bold,
    italic && styles.italic,
    underline && styles.underline,
    strikethrough && styles.strikethrough,
    code && styles.code,
    redacted && styles.redacted,
    size && styles[`size-${size}`],
    color && styles[`color-${color}`],
  ]
    .filter(isTruthy)
    .join(" ");
};
