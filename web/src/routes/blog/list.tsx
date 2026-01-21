import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { QueryBlogPostsInput } from "@notion-site/common/orpc/notion/blog-posts.js";
import { Col } from "../../components/layout/FlexBox.js";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostListLoader } from "../../components/notion/blog-posts/BlogPostListLoader.js";
import { Favicon } from "../../components/notion/typography/Favicon.js";
import { Head } from "../../providers/HeadProvider.js";
import { BlogPostFilters } from "../../components/filters/BlogPostFilters.js";

// export const path = "/blog";
export const index = true;

export function Component() {
  const [filters, setFilters] = useState<QueryBlogPostsInput>({
    query: "",
    limit: 5,
  });

  const query = useDebounce(filters.query, 250);

  return (
    <Col as="section" style={{ flex: 1 }}>
      <Head>
        <title>{["Blog", import.meta.env.VITE_SITE_TITLE].join(" • ")}</title>
        <Favicon icon={{ type: "emoji", emoji: "✏️" }} />
      </Head>

      <h2>All Blog Posts</h2>

      <Col pb={2}>
        <BlogPostFilters value={filters} onChange={setFilters} />
      </Col>

      <PageSuspenseBoundary resourceName="blog posts">
        <BlogPostListLoader filters={{ ...filters, query }} />
      </PageSuspenseBoundary>
    </Col>
  );
}
