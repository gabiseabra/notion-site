import { ReactNode } from "react";
import { OrpcContext, useOrpc } from "../../../providers/OrpcProvider.js";
import { suspend } from "suspend-react";
import { NestedBlocks } from "../NestedBlocks.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { ResourceMetadata } from "./ResourceMetadata.js";

export type ResourceLoaderProps<T = NotionResource> = {
  id: string;
  fetch: (id: string, orpc: OrpcContext) => Promise<T>;
  /**
   * Renders the resource's <head /> attributes.
   */
  head?: (page: T) => ReactNode;
  /**
   * Renders the resource's Metadata component.
   */
  header?: (page: T) => ReactNode;
  /**
   * Renders something on the bottom of the page.
   */
  footer?: (page: T) => ReactNode;
};

export function ResourceLoader<T extends NotionResource>({
  id,
  fetch,
  head,
  header = (resource) => (
    <ResourceMetadata as="header" size="l" resource={resource} />
  ),
  footer,
}: ResourceLoaderProps<T>) {
  const orpc = useOrpc();

  const [resource, { blocks }] = suspend(
    () => Promise.all([fetch(id, orpc), orpc.notion.pages.getBlocks({ id })]),
    [id, orpc],
  );

  return (
    <article>
      {head?.(resource)}

      {header?.(resource)}

      <NestedBlocks blocks={blocks} />

      {footer?.(resource)}
    </article>
  );
}
