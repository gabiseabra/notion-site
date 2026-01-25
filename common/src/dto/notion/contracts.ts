import z from "zod";
import { ErrorRecord } from "../../types/contract.js";
import { sentenceCase } from "../../utils/case.js";
import { zNotion } from "../notion/schema/index.js";
import { Route } from "../route.js";
import { _NotionResource } from "./resource.js";

export const Blocks = z.object({ blocks: zNotion.blocks.block.array() });

export type Blocks = z.infer<typeof Blocks>;

export const Metadata = _NotionResource
  .pick({
    id: true,
    cover: true,
    icon: true,
    url: true,
    parent: true,
  })
  .extend({
    route: Route,
    title: zNotion.properties.title.nullable(),
  });

export type Metadata = z.infer<typeof Metadata>;

export const ResourceId = z.object({ id: z.string().nonempty() });

export type ResourceId = z.infer<typeof ResourceId>;

export function ResourceResponse<DB>(schema: z.ZodSchema<DB>) {
  return z
    .object({
      route: Route,
    })
    .and(schema);
}

export type ResourceResponse<DB> = z.infer<
  ReturnType<typeof ResourceResponse<DB>>
>;

export function DatabaseResponse<DB>(schema: z.ZodSchema<DB>) {
  return z.object({
    items: schema.array(),
    pageInfo: z.object({
      nextCursor: z.string().nullable(),
      hasNextPage: z.boolean(),
    }),
  });
}

export type DatabaseResponse<DB> = z.infer<
  ReturnType<typeof DatabaseResponse<DB>>
>;

export function DatabasePropertyResponse<T extends string>(
  schema: z.ZodType<T>,
) {
  return z
    .object({
      name: schema,
      color: zNotion.primitives.color,
      description: z.string().nullable(),
    })
    .array();
}

export type DatabasePropertyResponse<T extends string> = z.infer<
  ReturnType<typeof DatabasePropertyResponse<T>>
>;

export function DatabaseErrors(name: string) {
  return {
    NO_DATABASE: {
      message: `${sentenceCase(name)} database not configured`,
      status: 501,
    },
  } as const;
}

export type DatabaseErrors = ErrorRecord<
  keyof ReturnType<typeof DatabaseErrors>
>;

export function ResourceErrors(name: string) {
  return {
    INVALID_ID: {
      message: `Invalid ${name.toLowerCase()} id`,
      status: 422,
      data: ResourceId,
    },
    NOT_FOUND: {
      message: `${sentenceCase(name)} not found`,
      status: 404,
      data: ResourceId,
    },
  } as const;
}

export type ResourceErrors = ErrorRecord<
  keyof ReturnType<typeof ResourceErrors>
>;
