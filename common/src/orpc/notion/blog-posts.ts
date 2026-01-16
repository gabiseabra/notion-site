import { oc } from "@orpc/contract";
import { BlogPost } from "../../dto/notion/blog-post.js";
import * as zn from "../../dto/notion/schema.js";
import z from "zod";

export const QueryBlogPostsInput = z.object({
  query: z.string(),
  limit: z.number().max(100),
  after: z.string().optional(),
  tags: z.string().array().optional(),
});
export type QueryBlogPostsInput = z.infer<typeof QueryBlogPostsInput>;

const QueryBlogPostsOutput = z.object({
  posts: BlogPost.array(),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

const GetAllTagsOutput = z
  .object({
    name: z.string(),
    color: zn.color,
    description: z.string().nullable(),
  })
  .array();

export const blogPosts = oc.prefix("/blog-posts").router({
  queryBlogPosts: oc
    .route({})
    .errors({
      NO_DATABASE: {
        message: "No blog posts database",
        status: 501,
      },
    })
    .input(QueryBlogPostsInput)
    .output(QueryBlogPostsOutput),

  getBlogPost: oc
    .route({})
    .errors({
      NO_DATABASE: {
        message: "No blog posts database",
        status: 501,
      },
      NOT_FOUND: {
        message: "Blog post not found",
        status: 404,
      },
    })
    .input(z.object({ id: z.string().nonempty() }))
    .output(BlogPost),

  getAllTags: oc
    .route({})
    .errors({
      NO_DATABASE: {
        message: "No blog posts database",
        status: 501,
      },
    })
    .output(GetAllTagsOutput),
});
