import { Outlet, RouteObject } from "react-router";
import { Layout } from "../components/ui/Layout.js";
import * as home from "./home.js";
import * as blog from "./blog/index.js";
import * as _404 from "./404.js";
import { getPathByRouteId } from "../utils/router.js";

export const element = (
  <Layout>
    <Outlet />
  </Layout>
);

export const children = [blog, home, _404];

/**
 * Provide route globally in order to access it from utility functions without circular dependencies.
 */
declare global {
  interface Window {
    route: RouteObject;
  }
}

window.route = { element, children };
