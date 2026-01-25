import { NotionPage } from "@notion-site/common/dto/pages/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { titleToString } from "@notion-site/common/utils/notion.js";
import * as env from "../../../env.js";
import { Head } from "../../../providers/HeadProvider.js";
import {
  ResourceLoader,
  ResourceLoaderProps,
} from "../resources/ResourceLoader.js";
import { Favicon } from "../typography/Favicon.js";

export type NotionPageLoaderProps = Omit<
  ResourceLoaderProps<NotionPage>,
  "resourceKey" | "fetch"
>;

/**
 * Fetches and renders a Notion page.
 * @async
 * @direction block
 */
export function NotionPageLoader({
  id,
  head = (page, { route }) => (
    <Head>
      <title>
        {[
          route.title ??
            titleToString(page.properties.title) ??
            "Untitled Page",
          env.SITE_TITLE,
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
      fetch={(id, orpc) => orpc.notion.getPage({ id })}
      head={head}
      {...slots}
    />
  );
}

NotionPageLoader.clear = ResourceLoader.clear("page");
