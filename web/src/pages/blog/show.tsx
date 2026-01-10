import { useParams } from "react-router";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { useQuery } from "@tanstack/react-query";

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

  console.log(blogPostQuery);

  return (
    <section>
      <h2>...</h2>
    </section>
  );
}
