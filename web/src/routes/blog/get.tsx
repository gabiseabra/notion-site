import { useParams } from "react-router";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { BlogPostMetadata } from "../../components/notion/blog-posts/BlogPostMetadata.js";
import { NestedBlocks } from "../../components/notion/NestedBlocks.js";
import { SuspenseBoundary } from "../../components/ui/SuspenseBoundary.js";
import { suspend } from "suspend-react";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  return (
    <SuspenseBoundary>
      <BlogPostPage id={id} />
    </SuspenseBoundary>
  );
}

function BlogPostPage({ id }: { id: string }) {
  const orpc = useOrpc();

  const blogPost = suspend(
    () => orpc.notion.blogPosts.getBlogPostById({ id }),
    [id, orpc],
  );

  return (
    <article>
      <BlogPostMetadata as="header" size="l" blogPost={blogPost} />

      <NestedBlocks data={blogPost.blocks} />
    </article>
  );
}
