import { RichText } from "../RichText.js";
import { Col, ColProps } from "../../block/FlexBox.js";
import { Icon } from "../Icon.js";
import { Text } from "../../inline/Text.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { getResourceUrl } from "../../../utils/url.js";
import { MaybeLink } from "../../inline/MaybeLink.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { ReactNode } from "react";

export function ResourceMetadata<T extends NotionResource>({
  as: Component,
  size,
  resource,
  hiddenTitle,
  before,
  after,
}: {
  as: ColProps["as"];
  size: "s" | "m" | "l";
  resource: T;
  hiddenTitle?: boolean;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const TextElement = size === "l" ? "h1" : "span";
  const textSize = ({ s: "h4", m: "h3", l: undefined } as const)[size];
  const gap = ({ s: 0.5, m: 1, l: 2 } as const)[size];
  const pb = ({ s: 0, m: 2, l: 4 } as const)[size];

  const title = Object.values(resource.properties).find(
    hasPropertyValue("type", "title"),
  );

  return (
    <Col as={Component} gap={gap} pb={pb}>
      {before}

      {!hiddenTitle && (
        <MaybeLink to={getResourceUrl(resource)}>
          <Text as={TextElement} size={textSize} style={{ marginBottom: 0 }}>
            {resource.icon && (
              <>
                <Icon data={resource.icon} size={size} />
                &nbsp;
              </>
            )}

            {title && <RichText as="span" data={title.title} />}
          </Text>
        </MaybeLink>
      )}

      {after}
    </Col>
  );
}
