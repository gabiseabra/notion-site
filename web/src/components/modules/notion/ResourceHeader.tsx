import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { ReactNode } from "react";
import { Link } from "react-router";
import { RichText } from "../../content/RichText.js";
import { Cover } from "../../display/Cover";
import { Icon } from "../../display/Icon.js";
import { Text } from "../../display/Text.js";
import { ColProps } from "../../layout/FlexBox.js";

export function ResourceHeader<DB extends NotionResource>({
  as: Component,
  size,
  resource,
  hiddenCover,
  hiddenTitle,
  before,
  after,
}: {
  as: ColProps["as"];
  size: "s" | "m" | "l";
  resource: DB;
  hiddenCover?: boolean;
  hiddenTitle?: boolean;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const TextElement = size === "l" ? "h1" : "div";
  const textSize = ({ s: "h4", m: "h3", l: undefined } as const)[size];
  const gap = ({ s: 1, m: 1, l: 2 } as const)[size];
  const mt = ({ s: 0, m: 1, l: 4 } as const)[size];
  const mb = ({ s: 0, m: 3, l: 6 } as const)[size];

  const hasCover = !hiddenCover && !!resource.cover;

  const title = Object.values(resource.properties).find(
    hasPropertyValue("type", "title"),
  );

  return (
    <Cover
      as={Component}
      gap={gap}
      mt={mt}
      mb={mb}
      cover={(hasCover && resource.cover) || undefined}
    >
      {before}

      {!hiddenTitle && (
        <Link
          to={resource.url}
          style={{
            fontSize: hasCover ? "1.5em" : undefined,
          }}
        >
          <Text as={TextElement} size={textSize} m={0}>
            {resource.icon && (
              <>
                <Icon icon={resource.icon} size={hasCover ? "auto" : size} />
                &nbsp;
              </>
            )}

            {title && <RichText value={title.title} />}
          </Text>
        </Link>
      )}

      {after}
    </Cover>
  );
}
