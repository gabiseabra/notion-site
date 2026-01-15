import * as zN from "@notion-site/common/dto/notion/schema.js";
import { match } from "ts-pattern";
import { ComponentProps } from "react";

/**
 * Renders a Notion icon.
 * @direction inline
 */
export function Icon({
  icon,
  size,
  style = {},
  ...props
}: ComponentProps<"div"> & { icon: zN.icon; size: "s" | "m" | "l" }) {
  const width = { s: "18px", m: "24px", l: "32px" }[size];

  return (
    <span
      style={{
        width,
        aspectRatio: 1,
        display: "inline-block",
        ...style,
      }}
      {...props}
    >
      {match(icon)
        .with({ type: "emoji" }, (icon) => (
          <span style={{ fontSize: width }}>{icon.emoji}</span>
        ))
        .with({ type: "custom_emoji" }, (icon) => (
          <img src={icon.custom_emoji.url} />
        ))
        .with({ type: "external" }, (icon) => <img src={icon.external.url} />)
        .with({ type: "file" }, (icon) => <img src={icon.file.url} />)
        .exhaustive()}
    </span>
  );
}
