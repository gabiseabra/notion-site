import { ComponentPropsWithoutRef, ReactNode, useState } from "react";
import * as css from "../../css/index.js";
import { Col } from "../layout/FlexBox.js";
import { Lightbox } from "../overlays/Lightbox.js";

type ImageProps = {
  caption?: ReactNode;
  indent?: number;
} & ComponentPropsWithoutRef<"img">;

export function Image({
  caption,
  indent = 0,
  style = {},
  ...props
}: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Col style={{ marginLeft: css.indent(indent) }}>
      <img
        style={{
          maxWidth: "100%",
          height: "auto",
          cursor: "pointer",
          ...style,
        }}
        onClick={() => setIsOpen(true)}
        {...props}
      />

      {caption && <div>{caption}</div>}

      <Lightbox
        open={isOpen}
        onClose={() => setIsOpen(false)}
        footer={caption && <div style={{ textAlign: "center" }}>{caption}</div>}
      >
        <img
          style={{
            maxWidth: "100%",
            maxHeight: "inherit",
            width: "auto",
            height: "auto",
            ...style,
          }}
          {...props}
        />
      </Lightbox>
    </Col>
  );
}
