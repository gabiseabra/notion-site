import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { useRef, useState } from "react";
import { useResizeObserver } from "../../hooks/use-resize-observer";
import { Col, ColProps } from "../layout/FlexBox";
import styles from "./Cover.module.scss";

type CoverProps = {
  cover?: NonNullable<NotionResource["cover"]>;
} & Omit<ColProps, "ref">;

export function Cover({ cover, children, className, ...props }: CoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coverHeight, setCoverHeight] = useState(0);

  useResizeObserver(containerRef, () => {
    if (!containerRef.current) {
      setCoverHeight(0);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    setCoverHeight(rect.y + rect.height);
  });

  return (
    <Col
      ref={containerRef}
      className={[className, styles.cover, cover && styles["has-image"]]
        .filter(isTruthy)
        .join(" ")}
      {...props}
    >
      {cover && (
        <div
          className={styles["cover-image"]}
          style={{
            height: coverHeight,
            backgroundImage: `url(${coverImage(cover)})`,
          }}
        />
      )}

      <div className={styles.content}>{children}</div>
    </Col>
  );
}

function coverImage(cover: zNotion.media.cover) {
  if (cover.type === "external") return cover.external.url;
  return cover.file.url;
}
