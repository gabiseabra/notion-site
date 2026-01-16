import { useLocation } from "react-router";
import { PageSuspenseBoundary } from "../components/feedback/SuspenseBoundary.js";
import { NotionPageLoader } from "../components/notion/pages/PageLoader.js";
import { DynamicBreadcrumbs } from "../components/notion/navigation/DynamicBreadcrumbs.js";

export const path = "*";

export function Component() {
  const { pathname } = useLocation();

  return (
    <PageSuspenseBoundary resourceName="the page">
      <NotionPageLoader
        id={pathname}
        header={(page) =>
          page.parent.type === "workspace" ? null : (
            <DynamicBreadcrumbs id={pathname} />
          )
        }
      />
    </PageSuspenseBoundary>
  );
}
