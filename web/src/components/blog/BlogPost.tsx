import { RichText } from "../notion/RichText.js";
import { Blocks } from "../notion/Blocks.js";
import { GetBlogPostOutput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { Badge } from "../ui/Badge.js";
import css from "./BlogPost.module.scss";

export function BlogPost({ blogPost }: { blogPost: GetBlogPostOutput }) {
  return (
    <article className={css.BlogPost}>
      <header>
        <h1>
          <RichText data={blogPost.properties.Title.title} />
        </h1>

        <div>
          Published
          <span>@</span>
          {blogPost.properties["Publish Date"].date.start.toLocaleDateString()}
        </div>

        <div>
          {blogPost.properties.Tags.multi_select.map((option) => (
            <Badge color={option.color}>{option.name}</Badge>
          ))}
        </div>
      </header>

      <Blocks data={blogPost.blocks} />
    </article>
  );
}
