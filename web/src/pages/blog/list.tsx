import { useOrpc } from "../../providers/OrpcProvider.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BlogPostList } from "../../components/blog/BlogPostList.js";
import { QueryErrorBanner } from "../../components/feedback/QueryErrorBanner.js";
import { Spinner } from "../../components/feedback/Spinner.js";
import { Col } from "../../components/ui/FlexBox.js";
import { Button } from "../../components/form/Button.js";

// export const path = "/blog";
export const index = true;

export function Component() {
  const orpc = useOrpc();
  const blogPostsQuery = useInfiniteQuery(
    orpc.blogPosts.getBlogPosts.infiniteOptions({
      input: (after) => ({ query: "", limit: 25, after }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: ({ pageInfo }) => pageInfo.nextCursor ?? undefined,
    }),
  );
  const posts = blogPostsQuery.data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <Col as="section" style={{ flex: 1 }}>
      <h2>All Blog Posts</h2>

      {blogPostsQuery.isError ? (
        <QueryErrorBanner
          query={blogPostsQuery}
          fallback="Failed to load bog posts"
        />
      ) : blogPostsQuery.isPending ? (
        <Col alignX="center" alignY="center" style={{ flex: 1 }}>
          <Spinner size="m" />
        </Col>
      ) : (
        <>
          <BlogPostList items={posts} />

          {blogPostsQuery.hasNextPage ? (
            <Button
              variant="plain"
              onClick={() => blogPostsQuery.fetchNextPage()}
            >
              Load more posts
            </Button>
          ) : (
            <Button variant="plain" disabled>
              You have reached the end
            </Button>
          )}
        </>
      )}
    </Col>
  );
}
