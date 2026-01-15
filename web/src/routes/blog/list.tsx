import { useOrpc } from "../../providers/OrpcProvider.js";
import { BlogPostList } from "../../components/notion/blog-posts/BlogPostList.js";
import { Col } from "../../components/block/FlexBox.js";
import { Button } from "../../components/form/Button.js";
import { PageSuspenseBoundary } from "../../components/ui/SuspenseBoundary.js";
import { useState } from "react";
import { suspend } from "suspend-react";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";

// export const path = "/blog";
export const index = true;

export const element = (
  <Col as="section" style={{ flex: 1 }}>
    <h2>All Blog Posts</h2>

    <title>{["Blog", import.meta.env.VITE_SITE_TITLE].join(" • ")}</title>

    <PageSuspenseBoundary resourceName="blog posts">
      <BlogPostsPage />
    </PageSuspenseBoundary>
  </Col>
);

function BlogPostsPage() {
  const [previousPosts, setPreviousPosts] = useState<BlogPost[]>([]);
  const [after, setAfter] = useState<string | null>(null);

  const orpc = useOrpc();
  const { posts, pageInfo } = suspend(
    () =>
      orpc.notion.blogPosts.queryBlogPosts({
        query: "",
        limit: 100,
        after: after ?? undefined,
      }),
    [after, orpc],
  );

  function onFetchNextPage() {
    setAfter(pageInfo.nextCursor);
    setPreviousPosts([...previousPosts, ...posts]);
  }

  return (
    <>
      <BlogPostList items={[...previousPosts, ...posts]} />

      {pageInfo.hasNextPage ? (
        <Button variant="plain" onClick={onFetchNextPage}>
          Load more posts
        </Button>
      ) : (
        <Button variant="plain" disabled>
          You have reached the end
        </Button>
      )}
    </>
  );
}
