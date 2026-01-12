import { oc } from "@orpc/contract";
import { BlogPost } from "../../notion/blog-post.js";
import * as zN from "../../notion/schema.js";
import z from "zod";

const GetBlogPostsInput = z.object({
  query: z.string(),
  limit: z.number().max(100),
  after: z.string().optional(),
  tags: z.string().array().optional(),
});

const GetBlogPostsOutput = z.object({
  posts: BlogPost.array(),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

const GetBlogPostOutput = BlogPost.extend({ blocks: zN.block.array() });

export const blogPosts = oc.prefix("/blog-posts").router({
  getBlogPosts: oc
    .route({})
    .input(GetBlogPostsInput)
    .output(GetBlogPostsOutput),

  getBlogPostById: oc
    .route({})
    .input(z.object({ id: z.string() }))
    .errors({
      NOT_FOUND: {
        message: "Blog post not found",
        status: 404,
      },
    })
    .output(GetBlogPostOutput),
});
