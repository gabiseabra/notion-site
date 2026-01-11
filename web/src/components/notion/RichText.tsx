import * as n from "@notion-site/common/dto/notion/schema.js";
import {
  hasPropertyValue,
  isTruthy,
} from "@notion-site/common/utils/guards.js";
import css from "./RichText.module.scss";

export function RichText({
  as: Component = "span",
  className,
  data,
}: {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "blockquote";
  className?: string;
  data: n.rich_text_item;
  color?: n.api_color; // ??
}) {
  return (
    <Component className={[className].filter(isTruthy).join(" ")}>
      {data.filter(hasPropertyValue("type", "text")).map((item) => {
        return (
          <Annotations annotations={item.annotations}>
            {item.text.content}
          </Annotations>
        );
      })}
    </Component>
  );
}

function Annotations({
  children,
  annotations,
}: {
  children: string;
  annotations: n.annotations;
}) {
  return (
    <span
      className={[
        annotations.bold && css.Bold,
        annotations.italic && css.Italic,
        annotations.underline && css.Underline,
        annotations.strikethrough && css.Strikethrough,
        annotations.code && css.Code,
        // @todo support colors
        // annotations.color && `color-${annotations.color}`,
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}
