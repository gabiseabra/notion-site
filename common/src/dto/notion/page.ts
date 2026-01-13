import { NotionDatabase } from "./database.js";
import z from "zod";
import * as zN from "./schema.js";

export const NotionPage = NotionDatabase({
  title: zN.title,
})
  // Exclude database resources
  .omit({ parent: true })
  .extend({ parent: z.union([zN.page_id, zN.workspace]) });
export type NotionPage = z.infer<typeof NotionPage>;
