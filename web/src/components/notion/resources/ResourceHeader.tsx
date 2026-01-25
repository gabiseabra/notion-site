import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { ReactNode } from "react";
import { Link } from "react-router";
import { Col, ColProps } from "../../layout/FlexBox.js";
import { Text } from "../../typography/Text.js";
import { Icon } from "../typography/Icon.js";
import { RichText } from "../typography/RichText.js";

export function ResourceHeader<DB extends NotionResource>({
  as: Component,
  size,
  resource,
  hiddenTitle,
  before,
  after,
}: {
  as: ColProps["as"];
  size: "s" | "m" | "l";
  resource: DB;
  hiddenTitle?: boolean;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const TextElement = size === "l" ? "h1" : "div";
  const textSize = ({ s: "h4", m: "h3", l: undefined } as const)[size];
  const gap = ({ s: 1, m: 1, l: 2 } as const)[size];
  const mt = ({ s: 0, m: 1, l: 4 } as const)[size];
  const mb = ({ s: 0, m: 3, l: 6 } as const)[size];

  const title = Object.values(resource.properties).find(
    hasPropertyValue("type", "title"),
  );

  return (
    <Col as={Component} gap={gap} mt={mt} mb={mb}>
      {before}

      {!hiddenTitle && (
        <Link to={resource.url}>
          <Text as={TextElement} size={textSize} m={0}>
            {resource.icon && (
              <>
                <Icon icon={resource.icon} size={size} />
                &nbsp;
              </>
            )}

            {title && <RichText data={title.title} />}
          </Text>
        </Link>
      )}

      {after}
    </Col>
  );
}
