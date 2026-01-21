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
  const [isPending, startTransition] = useTransition();
  const [previousPosts, setPreviousPosts] = useState<BlogPost[]>([]);
  const [input, setInput] = useState({ ...filters });

  // Reset pagination if filters change
  useEffect(() => {
    setInput({ ...filters });
    setPreviousPosts([]);
  }, [hash(filters)]);

  const orpc = useOrpc();
  const { posts, pageInfo } = suspend(
    () => orpc.notion.blogPosts.queryBlogPosts(input),
    ["blog-posts", hash(input)],
  );

  function onFetchNextPage() {
    const after = pageInfo.nextCursor;

    if (!after) return;

    startTransition(() => {
      setPreviousPosts((prev) => [...prev, ...posts]);
      setInput({ after, ...filters });
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
          loading={isPending}
        >
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
