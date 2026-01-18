import { Link, useParams } from "react-router";
import { suspend } from "suspend-react";
import { PageSuspenseBoundary } from "../../components/feedback/SuspenseBoundary.js";
import { BlogPostListLoader } from "../../components/notion/blog-posts/BlogPostListLoader.js";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { Badge } from "../../components/typography/Badge.js";
import { Text } from "../../components/typography/Text.js";
import { Favicon } from "../../components/notion/typography/Favicon.js";
import { Head } from "../../providers/HeadProvider.js";
import { Breadcrumbs } from "../../components/navigation/Breadcrumbs.js";

export const path = "/blog/tag/:tag";

export function Component() {
  const { tag = "" } = useParams<{ tag: string }>();

  return (
    <PageSuspenseBoundary resourceName="blog posts">
      <TagPageLoader tag={tag} />
    </PageSuspenseBoundary>
  );
}

function TagPageLoader({ tag: tagName }: { tag: string }) {
  const orpc = useOrpc();
  const allTags = suspend(() => orpc.notion.blogPosts.getAllTags(), [orpc]);

  const tag = allTags.find((tag) => compareTags(tagName, tag.name));

  if (!tag) {
    throw new Error(`Tag "${tagName}" does not exist.`);
  }

  return (
    <>
      <Head>
        <title>{[tag.name, import.meta.env.VITE_SITE_TITLE].join(" • ")}</title>
        <Favicon icon={{ type: "emoji", emoji: "🏷️" }} />
      </Head>

      <Breadcrumbs>
        <span>
          <Link to="/blog">Blog</Link>
        </span>

        <span>
          <Link to={`/blog/tag/${tag}`}>
            <Badge size="xs" color={tag.color}>
              {tag.name}
            </Badge>
          </Link>
        </span>
      </Breadcrumbs>

      <Text as="h2" style={{ display: "inline-flex", alignItems: "center" }}>
        Blog Posts Tagged "{tag.name}"
      </Text>

      {!!tag.description && (
        <Text as="p" size="caption" color="muted" mt={-3} mb={3}>
          {tag.description}
        </Text>
      )}

      <BlogPostListLoader filters={{ tags: [tag.name] }} />
    </>
  );
}

function compareTags(a: string, b: string) {
  return normalizeTag(a) === normalizeTag(b);
}

export function normalizeTag(tag: string) {
  return tag.replace(/\s/g, " ").replace(/-/g, " ").toLowerCase();
}
