import { createBrowserRouter, Outlet } from "react-router";
import { Root } from "../components/ui/Root.js";
import * as index from "./index.js";
import * as blog from "./blog/index.js";
import * as _404 from "./404.js";

export const createRouter = () => {
  return createBrowserRouter([
    {
      element: (
        <Root>
          <Outlet />
        </Root>
      ),
      children: [index, blog, _404],
    },
  ]);
};
