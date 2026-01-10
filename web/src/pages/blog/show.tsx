import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { RichText } from "../../components/notion/RichText.js";
import { Blocks } from "../../components/notion/Block.js";

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

  return (
    <article>
      <h1>
        <RichText data={blogPost.properties.Title.title} />
      </h1>

      <Blocks data={blogPost.blocks} />
    </article>
  );
}
