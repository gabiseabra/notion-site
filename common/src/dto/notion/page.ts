import { z } from "zod";
import * as n from "./schema.js";

export const Page = z.object({
  id: z.string(),
  url: z.string(),
  icon: n.icon.nullable(),
  cover: n.cover.nullable(),
  properties: z.object({
    Title: n.title,
  }),
});
export type Page = z.infer<typeof Page>;
