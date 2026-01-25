import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { match } from "ts-pattern";

/**
 * Renders a Notion icon as favicon.
 * @direction inline
 */
export function Favicon({ icon }: { icon: zNotion.media.icon }) {
  return match(icon)
    .with({ type: "emoji" }, ({ emoji }) => (
      <link
        rel="icon"
        href={[
          "data:image/svg+xml,",
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>",
          `<text y='1em' font-size='80'>${emoji}</text>`,
          "</svg>",
        ].join("")}
      />
    ))
    .with({ type: "custom_emoji" }, ({ custom_emoji }) => (
      <link
        rel="icon"
        type={getImageType(custom_emoji.url)}
        href={custom_emoji.url}
      />
    ))
    .with({ type: "file" }, ({ file }) => (
      <link rel="icon" type={getImageType(file.url)} href={file.url} />
    ))
    .with({ type: "external" }, ({ external }) => (
      <link rel="icon" type={getImageType(external.url)} href={external.url} />
    ))
    .otherwise(() => null);
}

function getImageType(url: string) {
  if (url.match(/\.ico$/)) return "image/vnd.microsoft.icon";
  if (url.match(/\.jpe?g$/)) return "image/jpeg";
  if (url.match(/\.png$/)) return "image/png";
}
