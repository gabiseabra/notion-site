import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { match } from "ts-pattern";
import { IconButton, IconButtonProps } from "../../typography/IconButton.js";

type IconProps = {
  size: IconButtonProps["size"];
  icon: zNotion.media.icon;
};

/**
 * Renders a Notion icon.
 * @direction inline
 */
export function Icon({ icon, size }: IconProps) {
  return (
    <IconButton as="span" color="currentColor" size={size}>
      {match(icon)
        .with({ type: "emoji" }, (icon) => icon.emoji)
        .with({ type: "custom_emoji" }, (icon) => (
          <img src={icon.custom_emoji.url} />
        ))
        .with({ type: "external" }, (icon) => <img src={icon.external.url} />)
        .with({ type: "file" }, (icon) => <img src={icon.file.url} />)
        .exhaustive()}
    </IconButton>
  );
}
