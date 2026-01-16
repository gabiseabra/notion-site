import { oc } from "@orpc/contract";
import { NotionPage } from "../../dto/notion/page.js";
import * as zN from "../../dto/notion/schema.js";
import z from "zod";
import { _NotionResource } from "../../dto/notion/resource.js";
import { Route } from "../../dto/route.js";

export const GetNotionPageOutput = NotionPage.extend({
  route: Route,
});
export type GetNotionPageOutput = z.infer<typeof GetNotionPageOutput>;

export const GetNotionMetadataOutput = _NotionResource.extend({
  route: Route,
});
export type GetNotionMetadataOutput = z.infer<typeof GetNotionMetadataOutput>;

export const pages = oc.prefix("/pages").router({
  getPage: oc
    .route({
      description: "Get the metadata of a notion page",
    })
    .errors({
      NOT_FOUND: {
        message: "Page not found",
        status: 404,
      },
    })
    .input(z.object({ id: z.string().nonempty() }))
    .output(GetNotionPageOutput),

  getMetadata: oc
    .route({
      description:
        "Get the metadata of a notion resource including all properties",
    })
    .errors({
      NOT_FOUND: {
        message: "Resource not found",
        status: 404,
      },
    })
    .input(z.object({ id: z.string().nonempty() }))
    .output(GetNotionMetadataOutput),

  getBlocks: oc
    .route({
      description: "Get the content of a Notion resource",
    })
    .input(z.object({ id: z.string().nonempty() }))
    .output(z.object({ blocks: zN.block.array() })),
});
