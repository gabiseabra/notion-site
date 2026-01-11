import { RichText } from "../notion/RichText.js";
import { Blocks } from "../notion/Blocks.js";
import { GetBlogPostOutput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { Badge } from "../ui/Badge.js";
import { DateLabel } from "../ui/DateLabel.js";
import { Row } from "../ui/FlexBox.js";
import css from "./BlogPost.module.scss";

export function BlogPost({ post }: { post: GetBlogPostOutput }) {
  return (
    <article className={css.BlogPost}>
      <header>
        <h1>
          <RichText data={post.properties.Title.title} />
        </h1>

        <DateLabel
          verb="Published"
          start={post.properties["Publish Date"].date.start}
        />

        <Row>
          {post.properties.Tags.multi_select.map((option) => (
            <Badge color={option.color}>{option.name}</Badge>
          ))}
        </Row>
      </header>

      <Blocks data={post.blocks} />
    </article>
  );
}
