import { Metadata } from "@notion-site/common/dto/notion/contracts.js";
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
  parent?: (metadata: Metadata) => ReactNode;
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
  parent = (metadata) =>
    metadata.parent.type === "page_id" && (
      <DynamicBreadcrumbs.Crumb id={metadata.parent.page_id} />
    ),
}: DynamicBreadcrumbsProps) {
  const orpc = useOrpc();
  const metadata = suspend(() => orpc.notion.getMetadata({ id: id }), [id]);

  return (
    <>
      {parent(metadata)}

      <span>
        <Link
          to={metadata.url}
          title={metadata.title ? titleToString(metadata.title) : undefined}
        >
          {metadata.route.crumb ?? (
            <>
              {metadata.icon && (
                <>
                  <Icon icon={metadata.icon} size="xs" />
                  &nbsp;
                </>
              )}

              {metadata.title && <RichText data={metadata.title.title} />}
            </>
          )}
        </Link>
      </span>
    </>
  );
};
