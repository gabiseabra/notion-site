import { ReactNode } from "react";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { titleToString } from "@notion-site/common/utils/notion.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";

export type BlogPostLoaderProps = {
  id: string;
  head?: (blogPost: BlogPost) => ReactNode;
  metadata?: (blogPost: BlogPost) => ReactNode;
  header?: (blogPost: BlogPost) => ReactNode;
  footer?: (blogPost: BlogPost) => ReactNode;
};

/**
 * Fetches and renders an entry from the blog-posts database.
 * @async
 * @direction block
 */
export function BlogPostLoader({
  id,
  head = (blogPost) => (
    <>
      <title>
        {[
          titleToString(blogPost.properties.Title) ?? "Untitled Blog Post",
          import.meta.env.VITE_SITE_TITLE,
        ].join(" • ")}
      </title>
    </>
  ),
  metadata = (blogPost) => (
    <BlogPostMetadata as="header" size="l" blogPost={blogPost} />
  ),
  ...slots
}: BlogPostLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      fetch={(id, orpc) => orpc.notion.blogPosts.getBlogPost({ id })}
      head={head}
      metadata={metadata}
      {...slots}
    />
  );
}
