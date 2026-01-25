import z from "zod";
import { NotionResource } from "../notion/resource.js";
import { zNotion } from "../notion/schema/index.js";

export const NotionPage = NotionResource({
  title: zNotion.properties.title,
})
  // Exclude database resources
  .omit({ parent: true })
  .extend({
    parent: z.union([zNotion.references.page_id, zNotion.references.workspace]),
  });
export type NotionPage = z.infer<typeof NotionPage>;
