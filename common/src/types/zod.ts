import { z } from "zod";

/**
 * Matches the shape of a zod object schema with `Discriminator` prop = `Value`.
 *
 * @example ```
 * const eyy = z.object({ type: z.literal("eyy") });
 * const lmao = z.object({ type: z.literal("lmao") });
 * const myUnion = z.discriminatedUnion("type", [eyy, lmao]);
 * // Extract<typeof myUnion["options"][number], zDiscriminatedUnionOption<"type", "lmao">> == typeof lmao
 * ```
 */
export type zDiscriminatedUnionOption<
  Discriminator extends string,
  Value extends string,
> = z.ZodObject<{ [k in Discriminator]: z.ZodLiteral<Value> } & z.ZodRawShape>;
