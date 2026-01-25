import { AnySchema, ErrorMapItem } from "@orpc/contract";

export type ErrorRecord<K extends string, V extends AnySchema = AnySchema> = {
  [k in K]: ErrorMapItem<V>;
};
