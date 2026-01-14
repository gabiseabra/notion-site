import { SuspenseBoundary } from "../ui/SuspenseBoundary.js";
import { suspend } from "suspend-react";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { MaybeLink } from "../inline/MaybeLink.js";
import { getResourceUrl } from "../../utils/url.js";
import { RichText } from "./RichText.js";
import { Icon } from "./Icon.js";
import { LinkProps } from "react-router";

/**
 * Renders a link to a Notion page by id.
 * The page's icon and title are fetched from the server.
 */
export function LinkToPage({
  id,
  ...props
}: { id: string } & Omit<LinkProps, "to">) {
  return (
    <SuspenseBoundary size="s" resourceName="the page">
      <LinkToPageLoader id={id} {...props} />
    </SuspenseBoundary>
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
    <MaybeLink to={getResourceUrl(resource)} {...props}>
      {resource.icon && (
        <>
          <Icon data={resource.icon} size="s" />
          &nbsp;
        </>
      )}

      {title && <RichText as="span" data={title.title} />}
    </MaybeLink>
  );
}
