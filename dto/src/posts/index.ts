import z from "zod";

export const Post = z.object({
  icon: z.string().nullable(),
  // title: z.string(),
  // body: z.string().array(),
  // relatedPosts: z.string().array(),
  // tags: z.string().array(),
  // publishedAt: z.date(),
});

export type Post = z.infer<typeof Post>;
