import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { BlogPost } from "../../components/blog/BlogPost.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  const orpc = useOrpc();
  const blogPostQuery = useQuery(
    orpc.blogPosts.getBlogPost.queryOptions({
      input: { id },
    }),
  );

  if (blogPostQuery.isPending || blogPostQuery.isError) return null;

  const blogPost = blogPostQuery.data;

  return <BlogPost post={blogPost} />;
}
