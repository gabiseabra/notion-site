import { oc } from "@orpc/contract";
import { NotionPage } from "../../dto/notion/page.js";
import * as zN from "../../dto/notion/schema.js";
import z from "zod";

const GetNotionPageOutput = NotionPage.extend({
  blocks: zN.block.array(),
});

export const pages = oc.prefix("/pages").router({
  getPageById: oc
    .route({})
    .errors({
      NOT_FOUND: {
        message: "Page not found",
        status: 404,
      },
    })
    .input(z.object({ id: z.string() }))
    .output(GetNotionPageOutput),
});
