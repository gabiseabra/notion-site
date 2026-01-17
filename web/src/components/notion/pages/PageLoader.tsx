import { ReactNode } from "react";
import { titleToString } from "@notion-site/common/utils/notion.js";
import { GetNotionPageOutput } from "@notion-site/common/orpc/notion/pages.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { Favicon } from "../typography/Favicon.js";
import { Head } from "../../../providers/HeadProvider.js";

export type NotionPageLoaderProps = {
  id: string;
  head?: (blogPost: GetNotionPageOutput) => ReactNode;
  metadata?: (blogPost: GetNotionPageOutput) => ReactNode;
  header?: (blogPost: GetNotionPageOutput) => ReactNode;
  footer?: (blogPost: GetNotionPageOutput) => ReactNode;
};

/**
 * Fetches and renders a Notion page.
 * @async
 * @direction block
 */
export function NotionPageLoader({
  id,
  head = (page) => (
    <Head>
      <title>
        {[
          page.route.title ??
            titleToString(page.properties.title) ??
            "Untitled Page",
          import.meta.env.VITE_SITE_TITLE,
        ]
          .filter(isTruthy)
          .join(" • ")}
      </title>

      {page.icon && <Favicon icon={page.icon} />}
    </Head>
  ),
  ...slots
}: NotionPageLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      resourceKey="page"
      fetch={(id, orpc) => orpc.notion.pages.getPage({ id })}
      head={head}
      {...slots}
    />
  );
}

NotionPageLoader.clear = ResourceLoader.clear("page");
