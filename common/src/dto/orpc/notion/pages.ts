import { oc } from "@orpc/contract";
import { NotionPage } from "../../notion/page.js";
import * as n from "../../notion/schema.js";
import z from "zod";

export const GetNotionPageOutput = NotionPage.extend({
  blocks: n.block.array(),
});
export type GetNotionPageOutput = z.infer<typeof GetNotionPageOutput>;

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
