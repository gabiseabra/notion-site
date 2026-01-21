import { z } from "zod";
import { NotionResource } from "./resource.js";
import * as zn from "./schema.js";

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
  Title: zn.title,
  "Publish Date": zn.date,
  Tags: zn._multi_select,
  Status: zn.status(BlogPostStatus.options),
});
export type BlogPost = z.infer<typeof BlogPost>;
