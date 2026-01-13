import { ReactNode } from "react";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";

export type BlogPostLoaderProps = {
  id: string;
  header?: (blogPost: BlogPost) => ReactNode;
  footer?: (blogPost: BlogPost) => ReactNode;
};

export function BlogPostLoader({
  id,
  header = (blogPost) => (
    <BlogPostMetadata as="header" size="l" blogPost={blogPost} />
  ),
  footer,
}: BlogPostLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      fetch={(id, orpc) => orpc.notion.blogPosts.getBlogPostById({ id })}
      header={header}
      footer={footer}
    />
  );
}
