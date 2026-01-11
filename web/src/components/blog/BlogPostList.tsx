import { RichText } from "../notion/RichText.js";
import { Badge } from "../ui/Badge.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { Link } from "react-router";
import { DateLabel } from "../ui/DateLabel.js";
import { Col, Row } from "../ui/FlexBox.js";
import css from "./BlogPostList.module.scss";
import { Icon } from "../notion/Icon.js";

export function BlogPostList({ items }: { items: BlogPost[] }) {
  return (
    <ul className={css.BlogPostList}>
      {items.map((post) => (
        <li key={post.url}>
          <Row alignX="space-between">
            <Row alignY="baseline">
              {post.icon && <Icon size="m" data={post.icon} />}

              <Link to={`/blog/${post.url}`} className={css.Link}>
                <RichText data={post.properties.Title.title} />
              </Link>
            </Row>

            <Col>
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
            </Col>
          </Row>
        </li>
      ))}
    </ul>
  );
}
