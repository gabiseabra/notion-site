import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import { ResourceList } from "../resources/ResourceList.js";
import { useNavigate } from "react-router";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  const navigate = useNavigate();

  return (
    <ResourceList
      items={items}
      getItemKey={(blogPost) => blogPost.id}
      onClick={(blogPost) => navigate(`/blog${blogPost.url}`)}
      render={(blogPost) => (
        <BlogPostMetadata
          key={blogPost.id}
          as="section"
          size="s"
          blogPost={blogPost}
        />
      )}
    />
  );
}
