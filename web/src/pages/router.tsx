import { createBrowserRouter } from "react-router";
import * as index from "./index.js";
import * as blog from "./blog/index.js";
import * as _404 from "./404.js";
import { App } from "../providers/App.js";

export const createRouter = () => {
  return createBrowserRouter([
    {
      element: <App />,
      children: [index, blog, _404],
    },
  ]);
};
