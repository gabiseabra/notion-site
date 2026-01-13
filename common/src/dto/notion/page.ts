import { NotionDatabase } from "./database.js";
import z from "zod";
import * as zN from "./schema.js";

export const NotionPage = NotionDatabase({
  title: zN.title,
});
export type NotionPage = z.infer<typeof NotionPage>;
