import {
  DatabaseErrors,
  ResourceErrors,
  ResourceId,
} from "@notion-site/common/dto/notion/contracts.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { Route } from "@notion-site/common/dto/route.js";
import { GenericObject } from "@notion-site/common/utils/types.js";
import {
  Meta,
  ORPCErrorConstructorMap,
  ProcedureHandlerOptions,
} from "@orpc/server";
import z from "zod";
import { getResourceUrl, matchRoute } from "../../utils/route.js";
import {
  getNotionDatabaseProperty,
  getNotionPage,
  queryNotionDatabase,
  QueryNotionDatabaseOptions,
} from "./api.js";

export function routeHandler<
  TIn extends ResourceId,
  TOut,
  TError extends ResourceErrors = ResourceErrors,
  TMeta extends Meta = Meta,
>(
  fn: (
    options: {
      route: Route;
    } & ProcedureHandlerOptions<
      GenericObject,
      TIn,
      ORPCErrorConstructorMap<TError>,
      TMeta
    >,
  ) => Promise<TOut>,
) {
  return async ({
    input,
    errors,
    ...args
  }: ProcedureHandlerOptions<
    GenericObject,
    TIn,
    ORPCErrorConstructorMap<TError>,
    TMeta
  >) => {
    const route = matchRoute(input.id);

    if (!route) {
      throw errors.NOT_FOUND({ data: { id: input.id } });
    }

    return fn({ ...args, errors, input, route });
  };
}

export function getNotionResourceHandler<DB extends NotionResource>(
  schema: z.ZodSchema<DB>,
) {
  return routeHandler(async ({ route, errors }) => {
    const resource = await getNotionPage(route.id, schema);

    if (!resource) {
      throw errors.NOT_FOUND({ data: { id: route.id } });
    }

    return {
      ...resource,
      route,
      url: getResourceUrl(resource) ?? resource.url,
    };
  });
}

export function queryNotionDatabaseHandler<DB extends NotionResource, Input>(
  databaseId: string | undefined,
  schema: z.ZodSchema<DB>,
  filters: (input: Input) => QueryNotionDatabaseOptions<DB>,
) {
  return async ({
    input,
    errors,
  }: {
    input: Input;
    errors: ORPCErrorConstructorMap<DatabaseErrors>;
  }) => {
    if (!databaseId) {
      throw errors.NO_DATABASE();
    }

    const { results, pageInfo } = await queryNotionDatabase(
      databaseId,
      schema,
      filters(input),
    );

    return {
      items: results.map((item) => ({
        ...item,
        url: getResourceUrl(item) ?? item.url,
      })),
      pageInfo,
    };
  };
}

export function getNotionDatabasePropertyHandler<T extends string>(
  databaseId: string | undefined,
  property: string,
  schema: z.ZodType<T>,
) {
  return async ({
    errors,
  }: {
    errors: ORPCErrorConstructorMap<DatabaseErrors>;
  }) => {
    if (!databaseId) {
      throw errors.NO_DATABASE();
    }

    const options = await getNotionDatabaseProperty(databaseId, property);

    return options.map(
      ({ name, ...option }) =>
        ({
          name: schema.parse(name),
          ...option,
        }) as const,
    );
  };
}
