import { createBrowserRouter, Outlet } from "react-router";
import { Layout } from "../components/ui/Layout.js";
import * as index from "./index.js";
import * as blog from "./blog/index.js";
import * as _404 from "./404.js";

export const createRouter = () => {
  return createBrowserRouter([
    {
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [index, blog, _404],
    },
  ]);
};
