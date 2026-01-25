import { match } from "ts-pattern";
import z from "zod";
import { Status } from "../primitives.js";

const zBlogPostStatus = z.enum(["Published", "Archived", "Draft", "In Review"]);

export type BlogPostStatus = z.infer<typeof zBlogPostStatus>;

export const BlogPostStatus = Object.assign(zBlogPostStatus, {
  isEmpty(status: BlogPostStatus) {
    return status === "Draft";
  },

  isInProgress(status: BlogPostStatus) {
    return status === "In Review";
  },

  isComplete(status: BlogPostStatus) {
    return status === "Archived" || status === "Published";
  },

  status(status: BlogPostStatus): Status {
    return match(status)
      .when(BlogPostStatus.isComplete, () => "completed" as const)
      .when(BlogPostStatus.isInProgress, () => "in-progress" as const)
      .when(BlogPostStatus.isEmpty, () => "empty" as const)
      .exhaustive();
  },
});
