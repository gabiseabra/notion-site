import { SuspenseBoundary } from "../ui/SuspenseBoundary.js";
import { suspend } from "suspend-react";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { MaybeLink } from "../inline/MaybeLink.js";
import { getResourceUrl } from "../../utils/url.js";
import { RichText } from "./RichText.js";
import { Icon } from "./Icon.js";
import { LinkProps } from "react-router";
import { Spinner } from "../inline/Spinner.js";
import * as css from "../../css/index.js";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Span } from "../inline/Text.js";
import { Row } from "../block/FlexBox.js";
import { BannerIcon } from "../block/Banner.js";

export function LinkToPage({
  id,
  ...props
}: { id: string } & Omit<LinkProps, "to">) {
  return (
    <SuspenseBoundary
      loading={<Spinner size="s" />}
      error={(error) => (
        <Row alignY="center">
          <BannerIcon type="error" />

          <Span color="red">{extractErrorMessage(error)}</Span>
        </Row>
      )}
    >
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
      <span style={{ display: "inline-flex", gap: css.space(1) }}>
        {resource.icon && <Icon data={resource.icon} size="s" />}

        {title && <RichText as="span" data={title.title} />}
      </span>
    </MaybeLink>
  );
}
