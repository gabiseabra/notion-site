import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { useNavigate } from "react-router";
import { EmptyState } from "../../feedback/EmptyState.js";
import { Col } from "../../layout/FlexBox.js";
import { ResourceList } from "../resources/ResourceList.js";
import { BlogPostHeader } from "./BlogPostHeader.js";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  const navigate = useNavigate();

  return (
    <ResourceList
      items={items}
      getItemKey={(blogPost) => blogPost.id}
      onClick={(blogPost) => navigate(blogPost.url)}
      emptyState={<EmptyState title="No blog posts found" />}
      render={(blogPost) => (
        <Col p={2}>
          <BlogPostHeader
            key={blogPost.id}
            as="section"
            size="s"
            blogPost={blogPost}
          />
        </Col>
      )}
    />
  );
}
