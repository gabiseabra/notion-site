import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { BlogPostHeader } from "./BlogPostHeader.js";
import styles from "./BlogPostList.module.scss";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  return (
    <ul className={styles.BlogPostList}>
      {items.map((post) => (
        <li key={post.url}>
          <BlogPostHeader size="m" post={post} />
        </li>
      ))}
    </ul>
  );
}
