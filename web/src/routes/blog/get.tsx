import { Link, useParams } from "react-router";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostLoader } from "../../components/notion/blog-posts/BlogPostLoader.js";
import { DynamicBreadcrumbs } from "../../components/notion/navigation/DynamicBreadcrumbs.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  return (
    <PageSuspenseBoundary
      resourceName="the blog post"
      onRetry={() => BlogPostLoader.clear(id)}
    >
      <BlogPostLoader
        id={id}
        before={() => (
          <DynamicBreadcrumbs
            id={id}
            parent={() => (
              <span>
                <Link to="/blog">Blog</Link>
              </span>
            )}
          />
        )}
      />
    </PageSuspenseBoundary>
  );
}
