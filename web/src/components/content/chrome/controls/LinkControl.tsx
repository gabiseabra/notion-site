import { Notion } from "@notion-site/common/utils/notion/index.js";
import { ComponentType, useState } from "react";
import { FaLink } from "react-icons/fa";
import { useDebounce } from "../../../../hooks/use-debounce.js";
import { LinkPreview } from "../../../feedback/LinkPreview.js";
import { Input } from "../../../inputs/Input.js";
import { Col } from "../../../layout/FlexBox.js";
import { IsolationFrame } from "../../../overlays/IsolationFrame.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import { ToolbarButton } from "../ToolbarButton.js";

export type LinkControlProps = {
  value?: Notion.RTF.Link;
  onChange: (link: Notion.RTF.Link) => void;
};

export type LinkControl = ComponentType<LinkControlProps>;

export function LinkControl({
  Overlay,
  Control,
  disabled,
  value,
  onChange,
  onOpen,
  ...props
}: {
  Overlay: AnchoredOverlay;
  Control: LinkControl;
  disabled?: boolean | "action";
  value?: Notion.RTF.Link;
  onChange: (link: Notion.RTF.Link) => void;
  onOpen?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Overlay
      open={isOpen}
      onClose={() => setIsOpen(false)}
      content={<Control value={value} onChange={onChange} />}
      {...props}
    >
      <ToolbarButton
        disabled={disabled}
        active={!!value}
        onClick={() => {
          const _isOpen = !disabled && !isOpen;
          setIsOpen(_isOpen);
          if (_isOpen) onOpen?.();
        }}
      >
        <FaLink />
      </ToolbarButton>
    </Overlay>
  );
}

export function PreviewLinkControl({
  value,
  onChange,
  reverse,
}: LinkControlProps & {
  reverse?: boolean;
}) {
  const debouncedUrl = useDebounce(value?.url, 300);

  return (
    <IsolationFrame
      resize="y"
      style={{ width: "min(calc(100vw - var(--gutter-content) * 2), 300px)" }}
    >
      <Col
        p={2}
        gap={2}
        style={{
          boxSizing: "border-box",
          width: "100vw",
          flexDirection: reverse ? "column-reverse" : "column",
        }}
      >
        {debouncedUrl && <LinkPreview url={debouncedUrl} />}

        <Input
          type="url"
          label="URL"
          size="m"
          value={value?.url ?? ""}
          onChange={(url) => onChange(url ? { url } : null)}
          onClear={() => onChange(null)}
        />
      </Col>
    </IsolationFrame>
  );
}
