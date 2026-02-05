import { ComponentPropsWithoutRef, ReactNode, useState } from "react";
import { Col } from "../layout/FlexBox.js";
import { Lightbox } from "../overlays/Lightbox.js";

type ImageProps = {
  caption?: ReactNode;
} & ComponentPropsWithoutRef<"img">;

export function Image({ caption, style = {}, ...props }: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Col>
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
            height: "auto",
            ...style,
          }}
          {...props}
        />
      </Lightbox>
    </Col>
  );
}
