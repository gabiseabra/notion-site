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
        <Col alignX="center" py={4}>
          <Spinner size="m" />
        </Col>
      }
      error={(error) => (
        <Banner type="error" size="m" style={{ margin: 0 }}>
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
      className={[styles.preview, className].join(" ")}
    >
      {media && (
        <div className={styles.media}>
          <img
            className={styles.image}
            src={preview.image ?? preview.favicon}
            alt=""
          />
        </div>
      )}

      <div className={styles.content}>
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

        <Text
          as="div"
          size="caption"
          color="muted"
          style={{ textDecoration: "underline" }}
          className={styles.url}
        >
          {url}
        </Text>
      </div>
    </a>
  );
}
