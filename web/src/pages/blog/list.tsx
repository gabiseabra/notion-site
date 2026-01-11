import { useOrpc } from "../../providers/OrpcProvider.js";
import { useQuery } from "@tanstack/react-query";
import { BlogPostList } from "../../components/blog/BlogPostList.js";
import { QueryErrorBanner } from "../../components/feedback/QueryErrorBanner.js";
import { Spinner } from "../../components/feedback/Spinner.js";
import { Col } from "../../components/ui/FlexBox.js";

// export const path = "/blog";
export const index = true;

export function Component() {
  const orpc = useOrpc();
  const blogPostsQuery = useQuery(
    orpc.blogPosts.getBlogPosts.queryOptions({
      input: { query: "" },
    }),
  );
  const posts = blogPostsQuery.data?.posts ?? [];

  return (
    <Col as="section" style={{ flex: 1 }}>
      <h2>All Blog Posts</h2>

      {blogPostsQuery.isError ? (
        <Col alignX="stretch" alignY="center" style={{ flex: 1 }}>
          <QueryErrorBanner
            query={blogPostsQuery}
            fallback="Failed to load bog posts"
          />
        </Col>
      ) : blogPostsQuery.isPending ? (
        <Col alignX="center" alignY="center" style={{ flex: 1 }}>
          <Spinner size="l" />
        </Col>
      ) : (
        <BlogPostList items={posts} />
      )}
    </Col>
  );
}
