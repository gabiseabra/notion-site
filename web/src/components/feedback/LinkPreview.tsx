import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { suspend } from "suspend-react";
import { useOrpc } from "../../providers/OrpcProvider.js";
import { Icon } from "../display/Icon.js";
import { Text } from "../display/Text.js";
import { Col, Row } from "../layout/FlexBox.js";
import { Banner } from "./Banner.js";
import styles from "./LinkPreview.module.scss";
import { Spinner } from "./Spinner.js";
import { SuspenseBoundary } from "./SuspenseBoundary.js";

type LinkPreviewProps = {
  url: string;
  className?: string;
};

export function LinkPreview({ url, className = "" }: LinkPreviewProps) {
  return (
    <SuspenseBoundary
      key={url}
      loading={
        <Col alignX="center" py={2}>
          <Spinner size="l" />
        </Col>
      }
      error={(error) => (
        <Banner type="error" size="m">
          {extractErrorMessage(error)}
        </Banner>
      )}
    >
      <LinkPreviewLoader url={url} className={className} />
    </SuspenseBoundary>
  );
}

function LinkPreviewLoader({ url, className = "" }: LinkPreviewProps) {
  const orpc = useOrpc();
  const preview = suspend(() => orpc.link.getPreview({ url }), [url]);
  const media = preview.image || preview.favicon;

  return (
    <a
      href={url}
      title={preview.title}
      className={[styles.link, className].join(" ")}
    >
      <Col as="div">
        {media && (
          <div className={styles.media}>
            <img
              className={styles.image}
              src={preview.image ?? preview.favicon}
              alt=""
            />
          </div>
        )}

        <Row as="div" alignY="center">
          {preview.favicon && (
            <Icon
              size="s"
              icon={{ type: "file", file: { url: preview.favicon } }}
            />
          )}

          <Text as="div" className={styles.title}>
            {preview.title}
          </Text>
        </Row>

        {preview.description && (
          <Text as="div" size="caption" color="muted">
            {preview.description}
          </Text>
        )}
      </Col>
    </a>
  );
}
