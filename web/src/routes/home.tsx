import { Outlet, redirect, RouteObject, useLoaderData } from "react-router";
import { PageSuspenseBoundary } from "../components/feedback/SuspenseBoundary.js";
import { NotionPageLoader } from "../components/notion/pages/PageLoader.js";
import { getPathByRouteId } from "../utils/router.js";

export const path = "/";

export const element = <Outlet />;

// @todo generate this from a json file
export const children: RouteObject[] = [
  notionPage({
    index: true,
    id: "2e7f40080aac8039a95ec99ac51b8a2d",
    title: import.meta.env.VITE_SITE_TITLE,
  }),
  notionPage({
    path: "/lmao",
    id: "2e7f40080aac8008a49df3ec2a14b74e",
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
      <PageSuspenseBoundary resourceName="the page">
        <NotionPageLoader id={id} />
      </PageSuspenseBoundary>
    );
  },
});

/** Utilities */

function notionPage({
  id,
  title,
  ...rest
}: {
  id: string;
  title?: string;
} & RouteObject): RouteObject {
  return {
    id,
    element: (
      <PageSuspenseBoundary resourceName="the page">
        <NotionPageLoader
          id={id}
          head={!title ? undefined : () => <title>{title}</title>}
        />
      </PageSuspenseBoundary>
    ),
    ...rest,
  };
}
