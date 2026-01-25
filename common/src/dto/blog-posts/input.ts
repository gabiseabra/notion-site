import z from "zod";
import { BlogPostStatus } from "./status.js";

export const BlogPostsInput = z.object({
  query: z.string(),
  limit: z.number().max(100),
  after: z.string().optional(),
  tags: z.string().array().optional(),
  statuses: BlogPostStatus.array().optional(),
});

export type BlogPostsInput = z.infer<typeof BlogPostsInput>;
