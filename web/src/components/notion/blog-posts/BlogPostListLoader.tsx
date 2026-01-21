import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { QueryBlogPostsInput } from "@notion-site/common/orpc/notion/blog-posts.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect, useState, useTransition } from "react";
import { suspend } from "suspend-react";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { Button } from "../../form/Button.js";
import { BlogPostList } from "./BlogPostList.js";

export function BlogPostListLoader({
  filters,
}: {
  filters: QueryBlogPostsInput;
}) {
  const [previousPosts, setPreviousPosts] = useState<BlogPost[]>([]);
  const [after, setAfter] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAfter(null);
    setPreviousPosts([]);
  }, [hash(filters)]);

  const orpc = useOrpc();
  const { posts, pageInfo } = suspend(
    () =>
      orpc.notion.blogPosts.queryBlogPosts({
        after: after ?? undefined,
        ...filters,
      }),
    [after, hash(filters), orpc],
  );

  function onFetchNextPage() {
    if (!pageInfo.nextCursor) return;

    startTransition(() => {
      setAfter(pageInfo.nextCursor);
      setPreviousPosts((prev) => [...prev, ...posts]);
    });
  }

  return (
    <>
      <BlogPostList items={[...previousPosts, ...posts]} />

      {pageInfo.hasNextPage ? (
        <Button
          variant="plain"
          color="primary"
          onClick={onFetchNextPage}
          disabled={isPending}
        >
          {isPending ? "Loading…" : "Load more posts"}
        </Button>
      ) : (
        <Button variant="plain" disabled>
          You have reached the end
        </Button>
      )}
    </>
  );
}
