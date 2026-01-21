import z from "zod";
import { NotionResource } from "./resource.js";
import * as zn from "./schema.js";

export const NotionPage = NotionResource({
  title: zn.title,
})
  // Exclude database resources
  .omit({ parent: true })
  .extend({ parent: z.union([zn.page_id, zn.workspace]) });
export type NotionPage = z.infer<typeof NotionPage>;
