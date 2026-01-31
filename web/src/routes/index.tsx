import { Outlet } from "react-router";
import { Favicon } from "../components/display/Favicon.js";
import { Layout } from "../components/layout/Layout.js";
import * as env from "../env.js";
import { Head } from "../providers/HeadProvider.js";
import * as blog from "./blog/index.js";
import * as page from "./page.js";

export const element = (
  <Layout>
    <Head>
      <title>{env.SITE_TITLE}</title>
      <Favicon icon={{ type: "emoji", emoji: "❓" }} />
    </Head>

    <Outlet />
  </Layout>
);

export const children = [blog, page];
