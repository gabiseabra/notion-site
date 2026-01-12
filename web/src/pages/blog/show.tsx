import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { QueryErrorBanner } from "../../components/block/QueryErrorBanner.js";
import { Spinner } from "../../components/inline/Spinner.js";
import { Col } from "../../components/block/FlexBox.js";
import { BlogPostMetadata } from "../../components/notion/blog-posts/BlogPostMetadata.js";
import { NestedBlocks } from "../../components/notion/NestedBlocks.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  const orpc = useOrpc();
  const blogPostQuery = useQuery(
    orpc.notion.blogPosts.getBlogPostById.queryOptions({
      input: { id },
    }),
  );

  if (blogPostQuery.isError)
    return (
      <Col alignX="center" alignY="center" style={{ flex: 1 }}>
        <QueryErrorBanner
          query={blogPostQuery}
          fallback="Failed to load bog post"
        />
      </Col>
    );

  if (blogPostQuery.isPending)
    return (
      <Col alignX="center" alignY="center" style={{ flex: 1 }}>
        <Spinner size="m" />
      </Col>
    );

  const blogPost = blogPostQuery.data;

  return (
    <article>
      <BlogPostMetadata as="header" size="l" blogPost={blogPost} />

      <NestedBlocks data={blogPost.blocks} />
    </article>
  );
}
