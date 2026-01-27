import { BlogPostsInput } from "@notion-site/common/dto/blog-posts/input.js";
import { BlogPostStatus } from "@notion-site/common/dto/blog-posts/status.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { suspend } from "suspend-react";
import * as env from "../../env.js";
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
  value: BlogPostsInput;
  onChange: (value: BlogPostsInput) => void;
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
  .filter(({ name }) => env.DEV || BlogPostStatus.isComplete(name))
  .map((option) => ({
    ...option,
    status: BlogPostStatus.status(option.name),
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
  const database = suspend(() => orpc.notion.describeBlogPosts(), [orpc]);

  return (
    <TagsFilter
      options={database.properties.Tags.multi_select.options}
      value={value}
      onChange={onChange}
    />
  );
}
