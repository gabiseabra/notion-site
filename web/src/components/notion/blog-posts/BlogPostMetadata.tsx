import { RichText } from "../RichText.js";
import { Badge } from "../../inline/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { Link } from "react-router";
import { Col, ColProps, Row } from "../../block/FlexBox.js";
import { Icon } from "../Icon.js";
import { Span, Text } from "../../inline/Text.js";
import { match } from "ts-pattern";
import * as css from "../../../css/index.js";
import { ResourceMetadata } from "../resources/ResourceMetadata.js";

const defaultHiddenProperties: (keyof BlogPost["properties"])[] = import.meta
  .env.DEV
  ? []
  : ["Status"];

export function BlogPostMetadata({
  blogPost,
  hiddenProperties = defaultHiddenProperties,
  ...props
}: {
  as: ColProps["as"];
  size: "s" | "m" | "l";
  blogPost: BlogPost;
  hiddenProperties?: (keyof BlogPost["properties"])[];
}) {
  return (
    <ResourceMetadata
      {...props}
      resource={blogPost}
      after={
        <Row wrap>
          {!hiddenProperties?.includes("Publish Date") &&
            blogPost.properties["Publish Date"].date && (
              <PublishedDate
                date={blogPost.properties["Publish Date"].date.start}
              />
            )}

          {!hiddenProperties?.includes("Status") &&
            blogPost.properties["Status"].status && (
              <Badge
                color={blogPost.properties["Status"].status.color}
                status={match(blogPost.properties["Status"].status.name)
                  .with("Published", () => "complete" as const)
                  .with("In Review", () => "in-progress" as const)
                  .with("Draft", () => "empty" as const)
                  .exhaustive()}
              >
                {blogPost.properties["Status"].status.name}
              </Badge>
            )}

          {!hiddenProperties?.includes("Tags") && (
            <>
              {blogPost.properties.Tags.multi_select.map((option) => (
                <Badge key={option.name} color={option.color}>
                  {option.name}
                </Badge>
              ))}
            </>
          )}
        </Row>
      }
    />
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
