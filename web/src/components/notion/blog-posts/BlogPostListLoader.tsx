import { BlogPostsInput } from "@notion-site/common/dto/blog-posts/input.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect, useState, useTransition } from "react";
import { suspend } from "suspend-react";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { Button } from "../../form/Button.js";
import { BlogPostList } from "./BlogPostList.js";

export function BlogPostListLoader({
  filters: initialFilters,
}: {
  filters: BlogPostsInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [previousItems, setPreviousItems] = useState<BlogPost[]>([]);
  const [filters, setFilters] = useState({ ...initialFilters });

  // Reset pagination if filters change
  useEffect(() => {
    setFilters({ ...initialFilters });
    setPreviousItems([]);
  }, [hash(initialFilters)]);

  const orpc = useOrpc();
  const { items, pageInfo } = suspend(
    () => orpc.notion.queryBlogPosts(filters),
    ["blog-posts", hash(filters)],
  );

  function onFetchNextPage() {
    const after = pageInfo.nextCursor;

    if (!after) return;

    startTransition(() => {
      setPreviousItems((prev) => [...prev, ...items]);
      setFilters({ after, ...filters });
    });
  }

  return (
    <>
      <BlogPostList items={[...previousItems, ...items]} />

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
