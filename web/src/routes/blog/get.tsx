import { useParams } from "react-router";
import { BlogPostMetadata } from "../../components/notion/blog-posts/BlogPostMetadata.js";
import { SuspenseBoundary } from "../../components/ui/SuspenseBoundary.js";
import { ResourceLoader } from "../../components/notion/resources/ResourceLoader.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  return (
    <SuspenseBoundary size="l" resourceName="the blog post">
      <ResourceLoader
        id={id}
        fetch={(id, orpc) => orpc.notion.blogPosts.getBlogPostById({ id })}
        header={(blogPost) => (
          <BlogPostMetadata as="header" size="l" blogPost={blogPost} />
        )}
      />
    </SuspenseBoundary>
  );
}
