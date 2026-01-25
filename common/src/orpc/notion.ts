import { oc } from "@orpc/contract";
import z from "zod";
import { BlogPost } from "../dto/blog-posts/index.js";
import { BlogPostsInput } from "../dto/blog-posts/input.js";
import {
  Blocks,
  DatabaseErrors,
  DatabasePropertyResponse,
  DatabaseResponse,
  Metadata,
  ResourceErrors,
  ResourceId,
  ResourceResponse,
} from "../dto/notion/contracts.js";
import { NotionPage } from "../dto/pages/index.js";

export const notion = oc.prefix("/notion").router({
  getBlocks: oc
    .route({
      description: "Get the content of a Notion resource",
    })
    .errors(ResourceErrors("resource"))
    .input(ResourceId)
    .output(Blocks),

  getMetadata: oc
    .route({
      description: "Get the metadata of a Notion resource",
    })
    .errors(ResourceErrors("resource"))
    .input(ResourceId)
    .output(Metadata),

  getPage: oc
    .route({
      description: `Get notion page metadata`,
    })
    .errors(ResourceErrors("notion page"))
    .input(ResourceId)
    .output(ResourceResponse(NotionPage)),

  getBlogPost: oc
    .route({
      description: `Get blog post metadata`,
    })
    .errors(ResourceErrors("blog post"))
    .input(ResourceId)
    .output(ResourceResponse(BlogPost)),

  getBlogPostTags: oc
    .route({
      description: `Get blog post tag options`,
    })
    .errors(DatabaseErrors("blog posts"))
    .output(DatabasePropertyResponse(z.string())),

  queryBlogPosts: oc
    .route({
      description: `Query blog posts database`,
    })
    .errors(DatabaseErrors("blog posts"))
    .input(BlogPostsInput)
    .output(DatabaseResponse(BlogPost)),
});
