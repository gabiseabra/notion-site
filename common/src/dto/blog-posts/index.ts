import { z } from "zod";
import { NotionResource } from "../notion/resource.js";
import { zNotion } from "../notion/schema/index.js";
import { BlogPostStatus } from "./status.js";

export const BlogPost = NotionResource({
  Title: zNotion.properties.title,
  "Publish Date": zNotion.properties.date,
  Tags: zNotion.properties.multi_select(z.string()),
  Status: zNotion.properties.status(BlogPostStatus),
});

export type BlogPost = z.infer<typeof BlogPost>;
