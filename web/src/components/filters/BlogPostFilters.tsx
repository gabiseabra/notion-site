import { BlogPostStatus } from "@notion-site/common/dto/notion/blog-post.js";
import { QueryBlogPostsInput } from "@notion-site/common/orpc/notion/blog-posts.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { suspend } from "suspend-react";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { Alert } from "../feedback/Banner.js";
import { Spinner } from "../feedback/Spinner.js";
import { SuspenseBoundary } from "../feedback/SuspenseBoundary.js";
import { Filters } from "./Filters.js";
import { TagsFilter, TagsFilterProps } from "./TagsFilter.js";

export function BlogPostFilters({
  value,
  onChange,
}: {
  value: QueryBlogPostsInput;
  onChange: (value: QueryBlogPostsInput) => void;
}) {
  return (
    <Filters
      title="Blog Posts Filters"
      query={{
        value: value.query,
        onChange: (query) => onChange({ ...value, query }),
        onClear: () => onChange({ ...value, query: "" }),
        placeholder: "Search blog posts",
      }}
      filters={[
        {
          label: "Status",
          description: "Show blog posts matching any of the statuses",
          active: !!value.statuses?.length,
          onClear: () => onChange({ ...value, statuses: undefined }),
          content: (
            <BlogPostStatusesFilter
              value={value.statuses ?? []}
              onChange={(statuses) => onChange({ ...value, statuses })}
            />
          ),
        },
        {
          label: "Tags",
          description: "Show blog posts matching all of the tags",
          active: !!value.tags?.length,
          onClear: () => onChange({ ...value, tags: undefined }),
          content: (
            <BlogPostTagsFilter
              value={value.tags ?? []}
              onChange={(tags) => onChange({ ...value, tags })}
            />
          ),
        },
      ]}
    />
  );
}

const statuses: TagsFilterProps<BlogPostStatus>["options"] = (
  [
    { name: "Published", color: "green" },
    { name: "Archived", color: "blue" },
    { name: "In Review", color: "yellow" },
    { name: "Draft", color: "gray" },
  ] as const
)
  .filter(({ name }) => import.meta.env.DEV || BlogPostStatus.isComplete(name))
  .map((option) => ({
    ...option,
    status: BlogPostStatus.isComplete(option.name)
      ? "complete"
      : BlogPostStatus.isInProgress(option.name)
        ? "in-progress"
        : "empty",
  }));

function BlogPostStatusesFilter({
  value,
  onChange,
}: {
  value: BlogPostStatus[];
  onChange: (values: BlogPostStatus[]) => void;
}) {
  return <TagsFilter options={statuses} value={value} onChange={onChange} />;
}

function BlogPostTagsFilter(props: {
  value: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <SuspenseBoundary
      loading={
        <p style={{ textAlign: "center" }}>
          <Spinner size="m" />
        </p>
      }
      error={(error) => (
        <p style={{ textAlign: "center" }}>
          <Alert type="error">{extractErrorMessage(error)}</Alert>
        </p>
      )}
    >
      <BlogPostTagsFilterLoader {...props} />
    </SuspenseBoundary>
  );
}

function BlogPostTagsFilterLoader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (values: string[]) => void;
}) {
  const orpc = useOrpc();
  const allTags = suspend(() => orpc.notion.blogPosts.getAllTags(), [orpc]);

  return <TagsFilter options={allTags} value={value} onChange={onChange} />;
}
