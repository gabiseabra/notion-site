import { oc } from "@orpc/contract";
import { Post } from "../posts/index.js";
import z from "zod";

export const GetPostsInput = z.object({
  query: z.string(),
  after: z.string().optional(),
  tags: z.string().array().optional(),
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
});
export type GetPostsInput = z.infer<typeof GetPostsInput>;

export const GetPostsOutput = z.object({
  posts: Post.array(),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});
export type GetPostsOutput = z.infer<typeof GetPostsOutput>;

export const posts = oc.prefix("/posts").router({
  getPosts: oc.route({}).input(GetPostsInput).output(GetPostsOutput),

  getPost: oc
    .route({})
    .input(z.object({ name: z.string() }))
    .output(GetPostsOutput),
});
