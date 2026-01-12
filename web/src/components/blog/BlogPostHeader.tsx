import { RichText } from "../notion/RichText.js";
import { Badge } from "../ui/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { Link } from "react-router";
import { Col, Row } from "../ui/FlexBox.js";
import { Icon } from "../notion/Icon.js";
import { Span, Text } from "../ui/Text.js";

export function BlogPostHeader({
  size,
  post,
  hiddenProperties,
}: {
  size: "m" | "l";
  post: BlogPost;
  hiddenProperties?: (keyof BlogPost["properties"])[];
}) {
  const TextElement = size === "l" ? "h1" : "span";
  const textSize = size === "m" ? "h3" : undefined;
  const gap = size === "l" ? 2 : 1;

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

      <Row alignX="space-between" style={{ marginTop: gap }}>
        {!hiddenProperties?.includes("Publish Date") &&
          post.properties["Publish Date"].date && (
            <PublishedDate date={post.properties["Publish Date"].date.start} />
          )}

        {!hiddenProperties?.includes("Tags") && (
          <Row>
            {post.properties.Tags.multi_select.map((option) => (
              <Badge key={option.name} color={option.color}>
                {option.name}
              </Badge>
            ))}
          </Row>
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
