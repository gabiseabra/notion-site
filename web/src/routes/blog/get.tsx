import { useParams } from "react-router";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostLoader } from "../../components/notion/blog-posts/BlogPostLoader.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  return (
    <PageSuspenseBoundary
      resourceName="the blog post"
      onRetry={() => BlogPostLoader.clear(id)}
    >
      <BlogPostLoader id={id} />
    </PageSuspenseBoundary>
  );
}
