import { Metadata } from "@notion-site/common/dto/notion/contracts.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { ReactNode } from "react";
import { clear, suspend } from "suspend-react";
import { OrpcContext, useOrpc } from "../../../providers/OrpcProvider.js";
import { NestedBlocks } from "../NestedBlocks.js";
import { ResourceHeader } from "./ResourceHeader.js";

export type ResourceLoaderProps<DB extends NotionResource> = {
  id: string;
  resourceKey: string;
  fetch: (id: string, orpc: OrpcContext) => Promise<DB>;
  /**
   * Renders something before all elements.
   */
  before?: (resource: DB, metadata: Metadata) => ReactNode;
  /**
   * Renders the <head /> attributes of the resource.
   */
  head?: (resource: DB, metadata: Metadata) => ReactNode;
  /**
   * Renders the header of the resource.
   */
  header?: (resource: DB, metadata: Metadata) => ReactNode;
  /**
   * Renders the footer of the resource.
   */
  footer?: (resource: DB, metadata: Metadata) => ReactNode;
  /**
   * Renders something after all elements.
   */
  after?: (resource: DB, metadata: Metadata) => ReactNode;
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
  before,
  head,
  header = (resource) => (
    <ResourceHeader as="header" size="l" resource={resource} />
  ),
  footer,
  after,
}: ResourceLoaderProps<T>) {
  const orpc = useOrpc();

  const [resource, metadata, { blocks }] = suspend(
    () =>
      Promise.all([
        fetch(id, orpc),
        orpc.notion.getMetadata({ id }),
        orpc.notion.getBlocks({ id }),
      ]),
    ["resource", resourceKey, id],
  );

  return (
    <article>
      {before?.(resource, metadata)}

      {head?.(resource, metadata)}

      {header?.(resource, metadata)}

      <NestedBlocks blocks={blocks} />

      {footer?.(resource, metadata)}

      {after?.(resource, metadata)}
    </article>
  );
}

ResourceLoader.clear = (resourceKey: string) => (id: string) =>
  clear(["resource", resourceKey, id]);
