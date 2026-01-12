import * as n from "@notion-site/common/dto/notion/schema.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { CSSProperties, ReactNode } from "react";
import styles from "./Text.module.scss";

type Arrayable<T> = T | T[];

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
  color: Arrayable<TextColor>;
} & Omit<n.annotations, "color">;

export type BlockAnnotations = {
  size: TextSize;
  color: Arrayable<TextColor>;
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
        indent && styles[`Indent-${{ 1: 1, 2: 2, 3: 3, 4: 4 }[indent] ?? 0}`],
        size && styles[`Size-${size}`],
        getColorClass(color),
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
        bold && styles.Bold,
        italic && styles.Italic,
        underline && styles.Underline,
        strikethrough && styles.Strikethrough,
        code && styles.Code,
        size && styles[`Size-${size}`],
        ...getColorClass(color),
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}

function getColorClass(color?: Arrayable<TextColor>) {
  return ([] as TextColor[])
    .concat(color ?? [])
    .filter((color) => color !== "default")
    .map((color) => styles[`Color-${color}`]);
}
