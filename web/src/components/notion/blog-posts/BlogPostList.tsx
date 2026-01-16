import { useNavigate } from "react-router";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import { ResourceList } from "../resources/ResourceList.js";
import { Col } from "../../layout/FlexBox.js";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  const navigate = useNavigate();

  return (
    <ResourceList
      items={items}
      getItemKey={(blogPost) => blogPost.id}
      onClick={(blogPost) => navigate(blogPost.url)}
      render={(blogPost) => (
        <Col p={2}>
          <BlogPostMetadata
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
