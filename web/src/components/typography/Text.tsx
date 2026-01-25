import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { omit } from "@notion-site/common/utils/object.js";
import { CSSProperties, ReactNode } from "react";
import * as css from "../../css/index.js";
import styles from "./Text.module.scss";

export type TextProps = {
  as: TextElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Partial<BlockAnnotations> &
  css.MarginProps &
  css.PaddingProps;

export type TextElement =
  | "div"
  | "p"
  | "blockquote"
  | "h1"
  | "h2"
  | "h3"
  | "h4";

export type TextColor =
  | zNotion.primitives.api_color
  | "primary"
  | "secondary"
  | "disabled"
  | "muted"
  | "link";

export type TextSize = "caption" | "body" | "h1" | "h2" | "h3" | "h4";

export type InlineAnnotations = {
  size: TextSize;
  color: TextColor;
} & Omit<zNotion.properties.annotations, "color">;

export type BlockAnnotations = {
  size: TextSize;
  color: TextColor;
  indent: number;
};

/**
 * A block element meant for wrapping around text.
 * @direction block
 */
export function Text({
  as: Tag,
  indent,
  color,
  size,
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

/**
 * An inline element for text with annotations.
 * @direction inline
 */
export function Span({
  children,
  bold,
  italic,
  underline,
  strikethrough,
  code,
  color,
  size,
  style,
}: {
  children: string;
  style?: CSSProperties;
} & Partial<InlineAnnotations>) {
  return (
    <span
      style={style}
      className={[
        bold && styles.bold,
        italic && styles.italic,
        underline && styles.underline,
        strikethrough && styles.strikethrough,
        code && styles.code,
        size && styles[`size-${size}`],
        color && styles[`color-${color}`],
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}
