import { oc } from "@orpc/contract";
import { Page } from "../notion/page.js";
import * as n from "../notion/schema.js";
import z from "zod";

export const GetPageOutput = Page.extend({ blocks: n.block.array() });
export type GetPageOutput = z.infer<typeof GetPageOutput>;

export const pages = oc.prefix("/pages").router({
  getPage: oc
    .route({})
    .errors({
      NOT_FOUND: {
        message: "Page not found",
        status: 404,
      },
    })
    .input(z.object({ id: z.string() }))
    .output(GetPageOutput),
});
