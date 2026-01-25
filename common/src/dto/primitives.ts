import z from "zod";

export const Status = z.enum(["completed", "in-progress", "empty"]);
export type Status = z.infer<typeof Status>;
