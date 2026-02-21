import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Link, LinkProps } from "react-router";
import { suspend } from "suspend-react";
import * as css from "../../css/index.js";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { RichText } from "../content/RichText.js";
import { Icon } from "../display/Icon.js";
import { Alert } from "../feedback/Banner.js";
import { Spinner } from "../feedback/Spinner.js";
import { SuspenseBoundary } from "../feedback/SuspenseBoundary.js";
import styles from "./LinkToPage.module.scss";

/**
 * Renders a link to a Notion page by id.
 * The page's icon and title are fetched from the server.
 * @direction block
 */
export function LinkToPage({
  id,
  indent = 0,
  ...props
}: { id: string; indent?: number } & Omit<LinkProps, "to">) {
  return (
    <p
      className={styles["link-to-page"]}
      style={{ marginLeft: css.indent(indent) }}
    >
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
  const resource = suspend(() => orpc.notion.getMetadata({ id }), [id]);

  return (
    <Link to={resource.url} {...props}>
      {resource.icon && (
        <>
          <Icon icon={resource.icon} size="s" />
          &nbsp;
        </>
      )}

      {resource.title && <RichText value={resource.title.title} />}
    </Link>
  );
}
