import {
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import * as css from "../../css/index.js";
import { Col, Row } from "../layout/FlexBox.js";
import { Lightbox } from "../overlays/Lightbox.js";
import { useGallery } from "./Gallery.js";
import { IconControl } from "./Icon";

type ImageProps = {
  caption?: ReactNode;
  indent?: number;
} & ComponentPropsWithoutRef<"img">;

export function Image({
  caption,
  indent = 0,
  style = {},
  onClick,
  ...props
}: ImageProps) {
  const id = useId();
  const thumbnail = useRef<HTMLImageElement | null>(null);
  const gallery = useGallery();
  const [isOpen, setIsOpen] = useState(false);
  const register = gallery?.register;

  useEffect(() => {
    if (!register || !thumbnail.current) return;
    return register(id, thumbnail.current);
  }, [id, register]);

  const open = () => (gallery ? gallery.open(id) : setIsOpen(true));
  const close = () => (gallery ? gallery.close() : setIsOpen(false));
  const openLightbox = gallery ? gallery.current === id : isOpen;

  return (
    <Col style={{ marginLeft: css.indent(indent) }}>
      <div style={{ width: "fit-content", margin: "auto" }}>
        <img
          ref={thumbnail}
          style={{
            maxWidth: "100%",
            height: "auto",
            cursor: "pointer",
            ...style,
          }}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) open();
          }}
          {...props}
        />

        {caption && <div>{caption}</div>}
      </div>

      <Lightbox
        open={openLightbox}
        onClose={close}
        footer={
          caption && (
            <Row alignY="center" px={1}>
              {gallery && (
                <IconControl
                  as="button"
                  size="m"
                  color="currentColor"
                  title="Previous image"
                  disabled={!gallery.next(id, "left")}
                  onClick={() => gallery.move("left")}
                >
                  <RxCaretLeft />
                </IconControl>
              )}

              <div style={{ flex: 1, textAlign: "center" }}>{caption}</div>

              {gallery && (
                <IconControl
                  as="button"
                  size="m"
                  color="currentColor"
                  title="Next image"
                  disabled={!gallery.next(id, "right")}
                  onClick={() => gallery.move("right")}
                >
                  <RxCaretRight />
                </IconControl>
              )}
            </Row>
          )
        }
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
