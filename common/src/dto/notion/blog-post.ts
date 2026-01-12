import { z } from "zod";
import * as n from "./schema.js";

export const BlogPostStatus = z.enum(["Published", "Draft", "In Review"]);
export type BlogPostStatus = z.infer<typeof BlogPostStatus>;

export const BlogPost = z.object({
  id: z.string(),
  url: z.string(),
  icon: n.icon.nullable(),
  properties: z.object({
    "Publish Date": n.date,
    Title: n.title,
    Tags: n._multi_select,
    Status: n.status(BlogPostStatus.options),
  }),
});
export type BlogPost = z.infer<typeof BlogPost>;
