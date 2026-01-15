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

const GetBlogPostOutput = BlogPost.extend({ blocks: zn.block.array() });

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
    .input(QueryBlogPostsInput)
    .output(QueryBlogPostsOutput),

  getBlogPost: oc
    .route({})
    .input(z.object({ id: z.string().nonempty() }))
    .errors({
      NOT_FOUND: {
        message: "Blog post not found",
        status: 404,
      },
    })
    .output(GetBlogPostOutput),

  getAllTags: oc.route({}).output(GetAllTagsOutput),
});
