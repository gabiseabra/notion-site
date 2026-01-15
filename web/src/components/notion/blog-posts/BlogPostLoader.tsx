import { ReactNode } from "react";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";
import { titleToString } from "@notion-site/common/utils/notion/properties.js";

export type BlogPostLoaderProps = {
  id: string;
  head?: (blogPost: BlogPost) => ReactNode;
  header?: (blogPost: BlogPost) => ReactNode;
  footer?: (blogPost: BlogPost) => ReactNode;
};

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
  header = (blogPost) => (
    <BlogPostMetadata as="header" size="l" blogPost={blogPost} />
  ),
  footer,
}: BlogPostLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      fetch={(id, orpc) => orpc.notion.blogPosts.getBlogPostById({ id })}
      head={head}
      header={header}
      footer={footer}
    />
  );
}
