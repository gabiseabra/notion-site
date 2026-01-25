import z from "zod";
import { zNotion } from "./notion/schema/index.js";

export const Route = z.object({
  id: z.string().describe(`The ID of the notion resource`),
  parent: z
    .discriminatedUnion("type", [
      zNotion.references.database_id,
      zNotion.references.page_id,
      zNotion.references.workspace,
    ])
    .optional()
    .describe("The parent resource of the page"),
  path: z.string().startsWith("/").describe(`The canonical path of the page`),
  crumb: z
    .string()
    .optional()
    .describe(`The breadcrumb title override of the page`),
  title: z.string().optional().describe(`The title override of the page`),
});
export type Route = z.infer<typeof Route>;
