import { Col } from "../../components/layout/FlexBox.js";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostListLoader } from "../../components/notion/blog-posts/BlogPostListLoader.js";
import { Favicon } from "../../components/notion/typography/Favicon.js";
import { Head } from "../../providers/HeadProvider.js";

// export const path = "/blog";
export const index = true;

export const element = (
  <Col as="section" style={{ flex: 1 }}>
    <Head>
      <title>{["Blog", import.meta.env.VITE_SITE_TITLE].join(" • ")}</title>
      <Favicon icon={{ type: "emoji", emoji: "✏️" }} />
    </Head>

    <h2>All Blog Posts</h2>

    <PageSuspenseBoundary resourceName="blog posts">
      <BlogPostListLoader />
    </PageSuspenseBoundary>
  </Col>
);
