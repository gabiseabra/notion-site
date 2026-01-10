import * as n from "@notion-site/common/dto/notion/schema.js";
import {
  hasPropertyValue,
  isTruthy,
} from "@notion-site/common/utils/guards.js";

export function RichText({
  as: Component = "span",
  data,
  color,
  indent,
}: {
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "blockquote";
  data: n.rich_text_item;
  color?: n.api_color;
  indent?: number;
}) {
  return (
    <Component
      className={[
        "RichText",
        color && `color-${color}`,
        indent && `indent-${indent}`,
      ]
        .filter(isTruthy)
        .join(" ")}
    >
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
        "Annotations",
        annotations.bold && "bold",
        annotations.italic && "italic",
        annotations.underline && "underline",
        annotations.strikethrough && "strikethrough",
        annotations.code && "code",
        annotations.color && `color-${annotations.color}`,
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {children}
    </span>
  );
}
