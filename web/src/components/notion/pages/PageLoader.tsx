import { ReactNode } from "react";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";
import { titleToString } from "@notion-site/common/utils/notion/properties.js";

export type NotionPageLoaderProps = {
  id: string;
  head?: (blogPost: NotionPage) => ReactNode;
  header?: (blogPost: NotionPage) => ReactNode;
  footer?: (blogPost: NotionPage) => ReactNode;
};

export function NotionPageLoader({
  id,
  head = (page) => (
    <>
      <title>
        {[
          titleToString(page.properties.title) ?? "Untitled Page",
          import.meta.env.VITE_SITE_TITLE,
        ].join(" • ")}
      </title>
    </>
  ),
  header,
  footer,
}: NotionPageLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      fetch={(id, orpc) => orpc.notion.pages.getPage({ id })}
      head={head}
      header={header}
      footer={footer}
    />
  );
}
