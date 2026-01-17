import { ReactNode } from "react";
import { OrpcContext, useOrpc } from "../../../providers/OrpcProvider.js";
import { clear, suspend } from "suspend-react";
import { NestedBlocks } from "../NestedBlocks.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { ResourceMetadata } from "./ResourceMetadata.js";

export type ResourceLoaderProps<T = NotionResource> = {
  id: string;
  resourceKey: string;
  fetch: (id: string, orpc: OrpcContext) => Promise<T>;
  /**
   * Renders the resource's <head /> attributes.
   */
  head?: (page: T) => ReactNode;
  /**
   * Renders the resource's Metadata component.
   */
  metadata?: (page: T) => ReactNode;
  /**
   * Renders something on top of the metadata component.
   */
  header?: (page: T) => ReactNode;
  /**
   * Renders something on the bottom of the page.
   */
  footer?: (page: T) => ReactNode;
};

/**
 * Fetches and renders a generic resource from Notion.
 * @async
 * @direction block
 */
export function ResourceLoader<T extends NotionResource>({
  id,
  resourceKey,
  fetch,
  head,
  metadata = (resource) => (
    <ResourceMetadata as="header" size="l" resource={resource} />
  ),
  header,
  footer,
}: ResourceLoaderProps<T>) {
  const orpc = useOrpc();

  const [resource, { blocks }] = suspend(
    () => Promise.all([fetch(id, orpc), orpc.notion.pages.getBlocks({ id })]),
    ["resource", resourceKey, id],
  );

  return (
    <article>
      {head?.(resource)}

      {header?.(resource)}

      {metadata?.(resource)}

      <NestedBlocks blocks={blocks} />

      {footer?.(resource)}
    </article>
  );
}

ResourceLoader.clear = (resourceKey: string) => (id: string) =>
  clear(["resource", resourceKey, id]);
