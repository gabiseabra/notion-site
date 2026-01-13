import { oc } from "@orpc/contract";
import { NotionPage } from "../../dto/notion/page.js";
import * as zN from "../../dto/notion/schema.js";
import z from "zod";
import { _NotionResource } from "../../dto/notion/resource.js";

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
    .output(NotionPage),

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
    .output(_NotionResource),

  getBlocks: oc
    .route({
      description: "Get the content of a Notion resource",
    })
    .input(z.object({ id: z.string().nonempty() }))
    .output(z.object({ blocks: zN.block.array() })),
});
