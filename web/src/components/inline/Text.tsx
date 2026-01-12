import * as n from "@notion-site/common/dto/notion/schema.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { CSSProperties, ReactNode } from "react";
import styles from "./Text.module.scss";

export type TextColor =
  | n.annotations["color"]
  | "primary"
  | "secondary"
  | "disabled"
  | "muted"
  | "link";

export type TextSize = "caption" | "body" | "h1" | "h2" | "h3" | "h4";

export type InlineAnnotations = {
  size: TextSize;
  color: TextColor;
} & Omit<n.annotations, "color">;

export type BlockAnnotations = {
  size: TextSize;
  color: TextColor;
  indent: number;
};

export type TextElement =
  | "span"
  | "p"
  | "blockquote"
  | "h1"
  | "h2"
  | "h3"
  | "h4";

export function Text({
  as: Tag,
  indent,
  color,
  size,
  children,
  className,
  ...props
}: {
  as: TextElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Partial<BlockAnnotations>) {
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
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Span({
  children,
  bold,
  italic,
  underline,
  strikethrough,
  code,
  color,
  size,
}: {
  children: string;
} & Partial<InlineAnnotations>) {
  return (
    <span
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
