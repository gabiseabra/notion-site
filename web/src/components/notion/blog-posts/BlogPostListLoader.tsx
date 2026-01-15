import { useState } from "react";
import { suspend } from "suspend-react";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { BlogPostList } from "./BlogPostList.js";
import { Button } from "../../form/Button.js";
import { QueryBlogPostsInput } from "@notion-site/common/orpc/notion/blog-posts.js";
import { hash } from "@notion-site/common/utils/hash.js";

export function BlogPostListLoader({
  filters,
}: {
  filters?: Partial<QueryBlogPostsInput>;
}) {
  const [previousPosts, setPreviousPosts] = useState<BlogPost[]>([]);
  const [after, setAfter] = useState<string | null>(null);

  const orpc = useOrpc();
  const { posts, pageInfo } = suspend(
    () =>
      orpc.notion.blogPosts.queryBlogPosts({
        query: "",
        limit: 100,
        after: after ?? undefined,
        ...filters,
      }),
    [after, hash(filters), orpc],
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
