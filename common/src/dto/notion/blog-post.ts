import { NotionDatabase } from "./database.js";
import * as n from "./schema.js";
import { z } from "zod";

export const BlogPostStatus = z.enum(["Published", "Draft", "In Review"]);
export type BlogPostStatus = z.infer<typeof BlogPostStatus>;

export const BlogPost = NotionDatabase({
  "Publish Date": n.date,
  Tags: n._multi_select,
  Status: n.status(BlogPostStatus.options),
});
export type BlogPost = z.infer<typeof BlogPost>;
