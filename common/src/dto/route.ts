import z from "zod";

export const Route = z.object({
  id: z.string(),
  path: z.string(),
  crumb: z.string().optional(),
  title: z.string().optional(),
});
export type Route = z.infer<typeof Route>;
