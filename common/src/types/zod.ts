import { z } from "zod";

export type zDiscriminatedUnionOption<
  Discriminator extends string,
  Value extends string,
> = z.ZodObject<{ [k in Discriminator]: z.ZodLiteral<Value> } & z.ZodRawShape>;
