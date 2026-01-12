import { NestedBlocks } from "../NestedBlocks.js";
import { GetBlogPostOutput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { BlogPostHeader } from "./BlogPostHeader.js";

export function BlogPost({ post }: { post: GetBlogPostOutput }) {
  return (
    <article>
      <BlogPostHeader size="l" post={post} />

      <NestedBlocks data={post.blocks} />
    </article>
  );
}
