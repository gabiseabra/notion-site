import { Outlet } from "react-router";
import { Layout } from "../components/ui/Layout.js";
import * as blog from "./blog/index.js";
import * as page from "./page.js";
import { Favicon } from "../components/notion/typography/Favicon.js";

export const element = (
  <Layout>
    <title>{import.meta.env.VITE_SITE_TITLE}</title>
    <Favicon icon={{ type: "emoji", emoji: "🍋" }} />

    <Outlet />
  </Layout>
);

export const children = [blog, page];
