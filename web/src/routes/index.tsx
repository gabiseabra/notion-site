import { Outlet } from "react-router";
import { Layout } from "../components/ui/Layout.js";
import * as home from "./home.js";
import * as blog from "./blog/index.js";
import * as _404 from "./404.js";

export const element = (
  <Layout>
    <Outlet />
  </Layout>
);

export const children = [blog, home, _404];
