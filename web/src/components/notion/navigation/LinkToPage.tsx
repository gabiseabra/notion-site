import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Link, LinkProps } from "react-router";
import { suspend } from "suspend-react";
import { useOrpc } from "../../../providers/OrpcProvider.js";
import { Alert } from "../../feedback/Banner.js";
import { Spinner } from "../../feedback/Spinner.js";
import { SuspenseBoundary } from "../../feedback/SuspenseBoundary.js";
import { Icon } from "../typography/Icon.js";
import { RichText } from "../typography/RichText.js";
import styles from "./LinkToPage.module.scss";

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

  return (
    <Link to={resource.url} {...props}>
      {resource.icon && (
        <>
          <Icon icon={resource.icon} size="s" />
          &nbsp;
        </>
      )}

      {title && <RichText data={title.title} />}
    </Link>
  );
}
