import { z } from "zod";
import { NotionResource } from "../notion/resource.js";
import { zNotion } from "../notion/schema/index.js";
import { BlogPostStatus } from "./status.js";

export const BlogPost = NotionResource({
  Title: zNotion.properties.title,
  "Publish Date": zNotion.primitives.date,
  Tags: zNotion.properties.multi_select(z.string()),
  Status: zNotion.properties.status(BlogPostStatus),
  Author: zNotion.properties.select(z.string()),
});

export type BlogPost = z.infer<typeof BlogPost>;
