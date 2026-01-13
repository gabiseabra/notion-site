import { NotionResource } from "./resource.js";
import z from "zod";
import * as zN from "./schema.js";

export const NotionPage = NotionResource({
  title: zN.title,
})
  // Exclude database resources
  .omit({ parent: true })
  .extend({ parent: z.union([zN.page_id, zN.workspace]) });
export type NotionPage = z.infer<typeof NotionPage>;
