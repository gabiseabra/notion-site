import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { BlogPostStatus } from "@notion-site/common/dto/blog-posts/status.js";
import { Link } from "react-router";
import { ColProps, Row } from "../../layout/FlexBox.js";
import { Badge } from "../../typography/Badge.js";
import { Span } from "../../typography/Text.js";
import { ResourceHeader } from "../resources/ResourceHeader.js";

export function BlogPostHeader({
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
    blogPost.properties["Status"].status?.name !== "Published"
      ? []
      : ["Status"];

  return (
    <ResourceHeader
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
                size="s"
                color={blogPost.properties["Status"].status.color}
                status={BlogPostStatus.status(
                  blogPost.properties["Status"].status.name,
                )}
              >
                {blogPost.properties["Status"].status.name}
              </Badge>
            )}

          {!hiddenProperties?.includes("Tags") && (
            <>
              {blogPost.properties.Tags.multi_select.map((tag) => (
                <Link key={tag.name} to={`/blog/tag/${tag.name}`}>
                  <Badge size="s" color={tag.color}>
                    {tag.name}
                  </Badge>
                </Link>
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
      <Span bold size="caption" color="muted">
        Published
      </Span>
      <Span bold size="caption" color="primary">
        &nbsp; @ &nbsp;
      </Span>
      <Span bold size="caption" color="muted">
        {date.toLocaleDateString()}
      </Span>
    </span>
  );
}
