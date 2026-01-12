import { NotionDatabase } from "./database.js";
import z from "zod";

export const NotionPage = NotionDatabase({});
export type NotionPage = z.infer<typeof NotionPage>;
