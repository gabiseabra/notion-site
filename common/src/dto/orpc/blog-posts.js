import { oc } from "@orpc/contract";
import { BlogPost } from "../notion/blog-post.js";
import z from "zod";
export const GetBlogPostsInput = z.object({
    query: z.string(),
    after: z.string().optional(),
    tags: z.string().array().optional(),
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
});
export const GetBlogPostsOutput = z.object({
    posts: BlogPost.array(),
    pageInfo: z.object({
        hasNextPage: z.boolean(),
        nextCursor: z.string().nullable(),
    }),
});
export const blogPosts = oc.prefix("/blog-posts").router({
    getBlogPosts: oc
        .route({})
        .input(GetBlogPostsInput)
        .output(GetBlogPostsOutput),
    getBlogPost: oc
        .route({})
        .input(z.object({ name: z.string() }))
        .errors({
        NOT_FOUND: {
            message: "Blog post not found",
            status: 404,
        },
    })
        .output(BlogPost),
});
//# sourceMappingURL=blog-posts.js.map