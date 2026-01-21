import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { titleToString } from "@notion-site/common/utils/notion.js";
import { ReactNode } from "react";
import { Link } from "react-router";
import { suspend } from "suspend-react";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { Alert } from "../../feedback/Banner.js";
import { Spinner } from "../../feedback/Spinner.js";
import { SuspenseBoundary } from "../../feedback/SuspenseBoundary.js";
import { Breadcrumbs } from "../../navigation/Breadcrumbs.js";
import { Icon } from "../typography/Icon.js";
import { RichText } from "../typography/RichText.js";

type DynamicBreadcrumbsProps = {
  id: string;
  parent?: (resource: NotionResource) => ReactNode;
};

export function DynamicBreadcrumbs(props: DynamicBreadcrumbsProps) {
  return (
    <Breadcrumbs>
      <DynamicBreadcrumbs.Crumb {...props} />
    </Breadcrumbs>
  );
}

DynamicBreadcrumbs.Crumb = function DynamicBreadcrumbsCrumb(
  props: DynamicBreadcrumbsProps,
) {
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
      <DynamicBreadcrumbs.CrumbLoader {...props} />
    </SuspenseBoundary>
  );
};

DynamicBreadcrumbs.CrumbLoader = function DynamicBreadcrumbsCrumbLoader({
  id,
  parent = (resource) =>
    resource.parent.type === "page_id" && (
      <DynamicBreadcrumbs.Crumb id={resource.parent.page_id} />
    ),
}: DynamicBreadcrumbsProps) {
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
      {parent(resource)}

      <span>
        <Link
          to={resource.url}
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
};
