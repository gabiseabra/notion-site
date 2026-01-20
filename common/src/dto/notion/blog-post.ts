import { NotionResource } from "./resource.js";
import * as zN from "./schema.js";
import { z } from "zod";

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
});

export const BlogPost = NotionResource({
  Title: zN.title,
  "Publish Date": zN.date,
  Tags: zN._multi_select,
  Status: zN.status(BlogPostStatus.options),
});
export type BlogPost = z.infer<typeof BlogPost>;
