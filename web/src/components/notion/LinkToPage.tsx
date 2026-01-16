import { SuspenseBoundary } from "../feedback/SuspenseBoundary.js";
import { suspend } from "suspend-react";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { MaybeLink } from "../typography/MaybeLink.js";
import { getResourceUrl } from "../../utils/url.js";
import { RichText } from "./RichText.js";
import { Icon } from "./Icon.js";
import { LinkProps } from "react-router";
import styles from "./LinkToPage.module.scss";
import { Spinner } from "../feedback/Spinner.js";
import { Alert } from "../feedback/Banner.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";

/**
 * Renders a link to a Notion page by id.
 * The page's icon and title are fetched from the server.
 * @direction block
 */
export function LinkToPage({
  id,
  ...props
}: { id: string } & Omit<LinkProps, "to">) {
  return (
    <p className={styles["link-to-page"]}>
      <SuspenseBoundary
        loading={<Spinner size="s" />}
        error={(error) => (
          <Alert type="error">{extractErrorMessage(error)}</Alert>
        )}
      >
        <LinkToPageLoader id={id} {...props} />
      </SuspenseBoundary>
    </p>
  );
}

function LinkToPageLoader({
  id,
  ...props
}: { id: string } & Omit<LinkProps, "to">) {
  const orpc = useOrpc();
  const resource = suspend(() => orpc.notion.pages.getMetadata({ id }), [id]);

  const title = Object.values(resource.properties).find(
    (prop) => prop.type === "title",
  );

  const url = getResourceUrl(resource);

  return (
    <MaybeLink to={url} {...props}>
      {resource.icon && (
        <>
          <Icon icon={resource.icon} size="s" />
          &nbsp;
        </>
      )}

      {title && <RichText data={title.title} />}
    </MaybeLink>
  );
}
