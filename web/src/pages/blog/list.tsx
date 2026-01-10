import { Link } from "react-router";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { useQuery } from "@tanstack/react-query";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";

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
      <ul>
        {posts.map((post) => (
          <li key={post.url}>
            <Link to={`/blog/${post.url}`}>
              {post.properties.Title.title
                .filter(hasPropertyValue("type", "text"))
                .map((title) => title.text.content)
                .join(" ")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
