import { oc } from "@orpc/contract";
import { BlogPost } from "../notion/blog-post.js";
import * as n from "../notion/schema.js";
import z from "zod";

export const GetBlogPostsInput = z.object({
  query: z.string(),
  after: z.string().optional(),
  tags: z.string().array().optional(),
});
export type GetBlogPostsInput = z.infer<typeof GetBlogPostsInput>;

export const GetBlogPostsOutput = z.object({
  posts: BlogPost.array(),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});
export type GetBlogPostsOutput = z.infer<typeof GetBlogPostsOutput>;


export const GetBlogPostOutput = BlogPost.extend({blocks: n.block.array() })
export type GetBlogPostOutput = z.infer<typeof GetBlogPostOutput>;

export const blogPosts = oc.prefix("/blog-posts").router({
  getBlogPosts: oc
    .route({})
    .input(GetBlogPostsInput)
    .output(GetBlogPostsOutput),

  getBlogPost: oc
    .route({})
    .input(z.object({ id: z.string() }))
    .errors({
      NOT_FOUND: {
        message: "Blog post not found",
        status: 404,
      },
    })
    .output(
      GetBlogPostOutput
    ),
});
