import { RichText } from "../notion/RichText.js";
import { Blocks } from "../notion/Blocks.js";
import { GetBlogPostOutput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { Badge } from "../ui/Badge.js";
import { DateLabel } from "../ui/DateLabel.js";
import { Row } from "../ui/FlexBox.js";
import css from "./BlogPost.module.scss";
import { Link } from "react-router";
import { Icon } from "../notion/Icon.js";

export function BlogPost({ post }: { post: GetBlogPostOutput }) {
  return (
    <article className={css.BlogPost}>
      <header>
        <Link to={`/blog/${post.url}`}>
          <h1>
            <Row gap={2}>
              {post.icon && <Icon data={post.icon} size="l" />}

              <RichText data={post.properties.Title.title} />
            </Row>
          </h1>
        </Link>

        {post.properties["Publish Date"].date && (
          <DateLabel
            verb="Published"
            start={post.properties["Publish Date"].date.start}
          />
        )}

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
