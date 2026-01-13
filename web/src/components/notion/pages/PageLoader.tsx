import { ReactNode } from "react";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { ResourceLoader } from "../resources/ResourceLoader.js";

export type NotionPageLoaderProps = {
  id: string;
  header?: (blogPost: NotionPage) => ReactNode;
  footer?: (blogPost: NotionPage) => ReactNode;
};

export function NotionPageLoader({
  id,
  header,
  footer,
}: NotionPageLoaderProps) {
  return (
    <ResourceLoader
      id={id}
      fetch={(id, orpc) => orpc.notion.pages.getPage({ id })}
      header={header}
      footer={footer}
    />
  );
}
