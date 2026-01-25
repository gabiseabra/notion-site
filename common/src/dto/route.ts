import z from "zod";

export const Route = z.object({
  id: z.string().describe(`The ID of the notion resource`),
  path: z.string().startsWith("/").describe(`The canonical path of the page`),
  crumb: z
    .string()
    .optional()
    .describe(`The breadcrumb title override of the page`),
  title: z.string().optional().describe(`The title override of the page`),
});
export type Route = z.infer<typeof Route>;
