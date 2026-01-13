import { Outlet, redirect, RouteObject, useLoaderData } from "react-router";
import { SuspenseBoundary } from "../components/ui/SuspenseBoundary.js";
import { NotionPageLoader } from "../components/notion/pages/PageLoader.js";
import { ComponentType } from "react";
import { getPathByRouteId } from "../utils/router.js";

export const path = "/";

export const element = <Outlet />;

// @todo generate this from a json file
export const children: RouteObject[] = [
  notionPage({
    index: true,
    id: "2e7f40080aac8039a95ec99ac51b8a2d",
    Component: NotionPageLoader,
  }),
  notionPage({
    path: "/lmao-123",
    id: "2e7f40080aac8008a49df3ec2a14b74e",
    Component: NotionPageLoader,
  }),
];

children.push({
  path: "/pages/:url",
  loader({ params: { url = "" } }) {
    const id = url.split("-").pop() ?? "";

    const path = getPathByRouteId(id);

    if (path) {
      return redirect(path);
    } else {
      return { id };
    }
  },
  Component() {
    const { id } = useLoaderData<{ id: string }>();

    return (
      <SuspenseBoundary>
        <NotionPageLoader id={id} />
      </SuspenseBoundary>
    );
  },
});

/** Utilities */

function notionPage({
  id,
  Component,
  ...rest
}: {
  id: string;
  Component: ComponentType<{ id: string }>;
} & RouteObject): RouteObject {
  return {
    id,
    element: (
      <SuspenseBoundary>
        <Component id={id} />
      </SuspenseBoundary>
    ),
    ...rest,
  };
}
