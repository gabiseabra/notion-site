import { suspend } from "suspend-react";
import { Link } from "react-router";
import { titleToString } from "@notion-site/common/utils/notion.js";
import { SuspenseBoundary } from "../../feedback/SuspenseBoundary.js";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { RichText } from "../typography/RichText.js";
import { Spinner } from "../../feedback/Spinner.js";
import { Alert } from "../../feedback/Banner.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Breadcrumbs } from "../../navigation/Breadcrumbs.js";
import { Icon } from "../typography/Icon.js";

export function DynamicBreadcrumbs({ id }: { id: string }) {
  return (
    <Breadcrumbs>
      <DynamicBreadcrumbsCrumb id={id} />
    </Breadcrumbs>
  );
}

function DynamicBreadcrumbsCrumb({ id }: { id: string }) {
  return (
    <SuspenseBoundary
      loading={
        <span>
          <Spinner size="xs" />
        </span>
      }
      error={(error) => (
        <span>
          <Alert type="error">{extractErrorMessage(error)}</Alert>
        </span>
      )}
    >
      <DynamicBreadcrumbsCrumbLoader id={id} />
    </SuspenseBoundary>
  );
}

function DynamicBreadcrumbsCrumbLoader({ id }: { id: string }) {
  const orpc = useOrpc();
  const resource = suspend(
    () => orpc.notion.pages.getMetadata({ id: id }),
    [id],
  );

  const title = Object.values(resource.properties).find(
    (prop) => prop.type === "title",
  );

  return (
    <>
      {resource.parent.type === "page_id" && (
        <DynamicBreadcrumbsCrumb id={resource.parent.page_id} />
      )}

      <span>
        <Link
          to={resource.route.path}
          title={title ? titleToString(title) : undefined}
        >
          {resource.route.crumb ?? (
            <>
              {resource.icon && (
                <>
                  <Icon icon={resource.icon} size="xs" />
                  &nbsp;
                </>
              )}

              {title && <RichText data={title.title} />}
            </>
          )}
        </Link>
      </span>
    </>
  );
}
