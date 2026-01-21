import { Outlet } from "react-router";
import { Favicon } from "../components/notion/typography/Favicon.js";
import { Layout } from "../components/ui/Layout.js";
import { Head } from "../providers/HeadProvider.js";
import * as blog from "./blog/index.js";
import * as page from "./page.js";

export const element = (
  <Layout>
    <Head>
      <title>{import.meta.env.VITE_SITE_TITLE}</title>
      <Favicon icon={{ type: "emoji", emoji: "❓" }} />
    </Head>

    <Outlet />
  </Layout>
);

export const children = [blog, page];
