import { NotionDatabase } from "./database.js";
import * as zN from "./schema.js";
import { z } from "zod";

export const BlogPostStatus = z.enum(["Published", "Draft", "In Review"]);
export type BlogPostStatus = z.infer<typeof BlogPostStatus>;

export const BlogPost = NotionDatabase({
  Title: zN.title,
  "Publish Date": zN.date,
  Tags: zN._multi_select,
  Status: zN.status(BlogPostStatus.options),
});
export type BlogPost = z.infer<typeof BlogPost>;
