import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { BlogPost } from "../../components/blog/BlogPost.js";
import { QueryErrorBanner } from "../../components/feedback/QueryErrorBanner.js";
import { Spinner } from "../../components/feedback/Spinner.js";
import { Col } from "../../components/ui/FlexBox.js";

export const path = "/blog/:url";

export function Component() {
  const { url = "" } = useParams();

  const id = url.split("-").pop() ?? "";

  const orpc = useOrpc();
  const blogPostQuery = useQuery(
    orpc.blogPosts.getBlogPost.queryOptions({
      input: { id },
    }),
  );

  if (blogPostQuery.isError)
    return (
      <Col alignX="center" alignY="center" style={{ flex: 1 }}>
        <QueryErrorBanner
          query={blogPostQuery}
          fallback="Failed to load bog post"
        />
      </Col>
    );

  if (blogPostQuery.isPending)
    return (
      <Col alignX="center" alignY="center" style={{ flex: 1 }}>
        <Spinner size="m" />
      </Col>
    );

  const blogPost = blogPostQuery.data;

  return <BlogPost post={blogPost} />;
}
