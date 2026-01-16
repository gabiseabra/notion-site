import { Badge } from "../../typography/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { ColProps, Row } from "../../layout/FlexBox.js";
import { Span } from "../../typography/Text.js";
import { match } from "ts-pattern";
import { ResourceMetadata } from "../resources/ResourceMetadata.js";

export function BlogPostMetadata({
  blogPost,
  hiddenProperties,
  ...props
}: {
  as: ColProps["as"];
  size: "s" | "m" | "l";
  blogPost: BlogPost;
  hiddenProperties?: (keyof BlogPost["properties"])[];
}) {
  // Hide published status badge in production since only published posts are listed anyways
  hiddenProperties ??=
    import.meta.env.DEV ||
    blogPost.properties["Status"].status?.name === "Published"
      ? []
      : ["Status"];

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
              {blogPost.properties.Tags.multi_select.map((tag) => (
                <a key={tag.name} href={`/blog/tag/${tag.name}`}>
                  <Badge color={tag.color}>{tag.name}</Badge>
                </a>
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
