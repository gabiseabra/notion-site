import { SuspenseBoundary } from "../../feedback/SuspenseBoundary.js";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { suspend } from "suspend-react";
import { getResourceUrl } from "../../../utils/url.js";
import { MaybeLink } from "../../navigation/MaybeLink.js";
import { RichText } from "../typography/RichText.js";
import { Spinner } from "../../feedback/Spinner.js";
import { Alert } from "../../feedback/Banner.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Breadcrumbs } from "../../navigation/Breadcrumbs.js";
import { Icon } from "../typography/Icon.js";
import { titleToString } from "@notion-site/common/utils/notion/properties.js";
import { getRouteById } from "../../../utils/router.js";

export function DynamicBreadcrumbs({ id }: { id: string }) {
  return (
    <Breadcrumbs>
      <DynamicBreadcrumbs.Crumb id={id} />
    </Breadcrumbs>
  );
}

DynamicBreadcrumbs.Crumb = function DynamicBreadcrumbCrumb({
  id,
}: {
  id: string;
}) {
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
      <DynamicBreadcrumbsLoader id={id} />
    </SuspenseBoundary>
  );
};

function DynamicBreadcrumbsLoader({ id }: { id: string }) {
  const orpc = useOrpc();
  const resource = suspend(() => orpc.notion.pages.getMetadata({ id }), [id]);

  const url = getResourceUrl(resource);

  const crumb = getRouteById(resource.id)?.crumb;
  const title = Object.values(resource.properties).find(
    (prop) => prop.type === "title",
  );

  return (
    <>
      {resource.parent.type === "page_id" && (
        <DynamicBreadcrumbs.Crumb id={resource.parent.page_id} />
      )}

      <span>
        <MaybeLink to={url} title={title ? titleToString(title) : undefined}>
          {crumb ?? (
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
        </MaybeLink>
      </span>
    </>
  );
}
