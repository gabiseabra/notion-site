import { useOrpc } from "../../providers/OrpcProvider.js";
import { useQuery } from "@tanstack/react-query";
import { BlogPostList } from "../../components/blog/BlogPostList.js";

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
    <section>
      <h2>All Blog Posts</h2>

      <BlogPostList items={posts} />
    </section>
  );
}
