import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { titleToString } from "@notion-site/common/utils/notion.js";
import * as env from "../../../env.js";
import { Head } from "../../../providers/HeadProvider.js";
import {
  ResourceLoader,
  ResourceLoaderProps,
} from "../resources/ResourceLoader.js";
import { Favicon } from "../typography/Favicon.js";
import { BlogPostHeader } from "./BlogPostHeader.js";

export type BlogPostLoaderProps = Omit<
  ResourceLoaderProps<BlogPost>,
  "resourceKey" | "fetch"
>;

/**
 * Fetches and renders an entry from the blog-posts database.
 * @async
 * @direction block
 */
export function BlogPostLoader({
  id,
  head = (blogPost) => (
    <Head>
      <title>
        {[
          titleToString(blogPost.properties.Title) ?? "Untitled Blog Post",
          env.SITE_TITLE,
        ].join(" • ")}
      </title>

      {blogPost.icon && <Favicon icon={blogPost.icon} />}
    </Head>
  ),
  header = (blogPost) => (
    <BlogPostHeader as="header" size="l" blogPost={blogPost} />
  ),
  ...slots
}: BlogPostLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      resourceKey="blog-post"
      fetch={(id, orpc) => orpc.notion.getBlogPost({ id })}
      head={head}
      header={header}
      {...slots}
    />
  );
}

BlogPostLoader.clear = ResourceLoader.clear("blog-post");
