import { RichText } from "../notion/RichText.js";
import { Badge } from "../ui/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { Link } from "react-router";
import { Col, Row } from "../ui/FlexBox.js";
import { Icon } from "../notion/Icon.js";
import { Span, Text } from "../ui/Text.js";
import { match } from "ts-pattern";
import * as css from "../../styles/variables.js";

const defaultHiddenProperties: (keyof BlogPost["properties"])[] = import.meta
  .env.DEV
  ? []
  : ["Status"];

export function BlogPostHeader({
  size,
  post,
  hiddenProperties = defaultHiddenProperties,
}: {
  size: "s" | "m" | "l";
  post: BlogPost;
  hiddenProperties?: (keyof BlogPost["properties"])[];
}) {
  const TextElement = size === "l" ? "h1" : "span";
  const textSize = ({ s: "h4", m: "h3", l: undefined } as const)[size];
  const gap = ({ s: 0.5, m: 1, l: 2 } as const)[size];

  return (
    <Col as="header" gap={gap}>
      {!hiddenProperties?.includes("Title") && (
        <Link to={`/blog/${post.url}`}>
          <Text as={TextElement} size={textSize} style={{ marginBottom: 0 }}>
            {post.icon && <Icon data={post.icon} size={size} />}
            &nbsp;
            <RichText as="span" data={post.properties.Title.title} />
          </Text>
        </Link>
      )}

      <Row
        style={{ marginBottom: `calc(${css.space} * ${size === "l" ? 4 : 2})` }}
      >
        {!hiddenProperties?.includes("Publish Date") &&
          post.properties["Publish Date"].date && (
            <PublishedDate date={post.properties["Publish Date"].date.start} />
          )}

        {!hiddenProperties?.includes("Status") &&
          post.properties["Status"].status && (
            <Badge
              color={post.properties["Status"].status.color}
              status={match(post.properties["Status"].status.name)
                .with("Published", () => "complete" as const)
                .with("In Review", () => "in-progress" as const)
                .with("Draft", () => "empty" as const)
                .exhaustive()}
            >
              {post.properties["Status"].status.name}
            </Badge>
          )}

        {!hiddenProperties?.includes("Tags") && (
          <>
            {post.properties.Tags.multi_select.map((option) => (
              <Badge key={option.name} color={option.color}>
                {option.name}
              </Badge>
            ))}
          </>
        )}
      </Row>
    </Col>
  );
}

function PublishedDate({ date }: { date: Date }) {
  return (
    <Text as="span" size="caption">
      <Span bold color="disabled">
        Published
      </Span>
      <Span bold color="primary">
        &nbsp; @ &nbsp;
      </Span>
      <Span bold color="disabled">
        {date.toLocaleDateString()}
      </Span>
    </Text>
  );
}
