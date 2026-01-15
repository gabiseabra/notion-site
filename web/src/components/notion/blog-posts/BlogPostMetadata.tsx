import { Badge } from "../../inline/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { ColProps, Row } from "../../block/FlexBox.js";
import { Span } from "../../inline/Text.js";
import { match } from "ts-pattern";
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
      hiddenTitle={hiddenProperties?.includes("Title")}
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
    <span>
      <Span bold size="caption" color="disabled">
        Published
      </Span>
      <Span bold size="caption" color="primary">
        &nbsp; @ &nbsp;
      </Span>
      <Span bold size="caption" color="disabled">
        {date.toLocaleDateString()}
      </Span>
    </span>
  );
}
