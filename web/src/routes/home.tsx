import { ReactNode } from "react";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { Outlet, RouteObject, useLoaderData } from "react-router";
import { SuspenseBoundary } from "../components/ui/SuspenseBoundary.js";
import { useOrpc } from "../providers/OrpcProvider.js";
import { suspend } from "suspend-react";
import { NestedBlocks } from "../components/notion/NestedBlocks.js";
import { RichText } from "../components/notion/RichText.js";
import { DistributiveOmit } from "@notion-site/common/utils/types.js";
import { MaybeLink } from "../components/inline/MaybeLink.js";
import { getResourceUrl } from "./url.js";

/** RouteObject exports */

export const path = "/";

export const element = <Outlet />;

// @todo generate this from a json file
export const children: RouteObject[] = [
  createRoute({
    id: "2e7f40080aac8039a95ec99ac51b8a2d",
    index: true,
  }),
];

// add a route to render any page by id
// @todo link any links to notion pages to this route
children.push({
  path: "/pages/:url",
  loader({ params: { url = "" } }) {
    const id = url.split("-").pop() ?? "";

    // @todo find route from children with the id and redirect to the canonical url

    return { id };
  },
  Component() {
    const { id } = useLoaderData<{ id: string }>();

    return (
      <SuspenseBoundary>
        <NotionPagePage id={id} />
      </SuspenseBoundary>
    );
  },
});

/** Utilities */

function createRoute({
  id,
  props = {},
  ...rest
}: {
  id: string;
  props?: Omit<NotionPagePageProps, "id">;
} & DistributiveOmit<RouteObject, "id" | "element">): RouteObject {
  return {
    ...rest,
    id,
    element: (
      <SuspenseBoundary>
        <NotionPagePage id={id} {...props} />
      </SuspenseBoundary>
    ),
  };
}

/** NotionPagePage component */

type NotionPagePageProps = {
  id: string;
  header?: (page: NotionPage) => ReactNode;
  footer?: (page: NotionPage) => ReactNode;
};

function NotionPagePage({
  id,
  header = (page) => (
    <MaybeLink to={getResourceUrl(page)}>
      <RichText as="h1" data={page.properties.title.title} />
    </MaybeLink>
  ),
  footer,
}: NotionPagePageProps) {
  const orpc = useOrpc();

  const [page, { blocks }] = suspend(
    () =>
      Promise.all([
        orpc.notion.pages.getPage({ id }),
        orpc.notion.pages.getBlocks({ id }),
      ]),
    [id, orpc],
  );

  return (
    <article>
      {header(page)}

      <NestedBlocks data={blocks} />

      {footer?.(page)}
    </article>
  );
}
