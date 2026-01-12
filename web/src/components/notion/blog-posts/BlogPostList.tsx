import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostMetadata } from "./BlogPostMetadata.js";
import styles from "./BlogPostList.module.scss";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  return (
    <ul className={styles["blog-post-list"]}>
      {items.map((blogPost) => (
        <li key={blogPost.url}>
          <BlogPostMetadata as="section" size="s" blogPost={blogPost} />
        </li>
      ))}
    </ul>
  );
}
