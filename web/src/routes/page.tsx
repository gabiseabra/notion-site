import { useLocation } from "react-router";
import { PageSuspenseBoundary } from "../components/feedback/SuspenseBoundary.js";
import { DynamicBreadcrumbs } from "../components/notion/navigation/DynamicBreadcrumbs.js";
import { NotionPageLoader } from "../components/notion/pages/PageLoader.js";

export const path = "*";

export function Component() {
  const { pathname } = useLocation();

  return (
    <PageSuspenseBoundary
      key={pathname}
      resourceName="the page"
      onRetry={() => NotionPageLoader.clear(pathname)}
    >
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
