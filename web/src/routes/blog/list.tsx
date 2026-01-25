import { BlogPostsInput } from "@notion-site/common/dto/blog-posts/input.js";
import { useState } from "react";
import { clear } from "suspend-react";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostFilters } from "../../components/filters/BlogPostFilters.js";
import { Col } from "../../components/layout/FlexBox.js";
import { BlogPostListLoader } from "../../components/notion/blog-posts/BlogPostListLoader.js";
import { Favicon } from "../../components/notion/typography/Favicon.js";
import * as env from "../../env.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { Head } from "../../providers/HeadProvider.js";

// export const path = "/blog";
export const index = true;

export function Component() {
  const [filters, setFilters] = useState<BlogPostsInput>({
    query: "",
    limit: 25,
  });

  const query = useDebounce(filters.query, 250);

  return (
    <Col as="section" style={{ flex: 1 }}>
      <Head>
        <title>{["Blog", env.SITE_TITLE].join(" • ")}</title>
        <Favicon icon={{ type: "emoji", emoji: "✏️" }} />
      </Head>

      <h2>All Blog Posts</h2>

      <Col pb={2}>
        <BlogPostFilters value={filters} onChange={setFilters} />
      </Col>

      <PageSuspenseBoundary resourceName="blog posts" onRetry={() => clear()}>
        <BlogPostListLoader filters={{ ...filters, query }} />
      </PageSuspenseBoundary>
    </Col>
  );
}
