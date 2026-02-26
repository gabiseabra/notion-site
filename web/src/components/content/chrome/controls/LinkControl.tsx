import { Notion } from "@notion-site/common/utils/notion/index.js";
import { useState } from "react";
import { FaLink } from "react-icons/fa";
import { Input } from "../../../inputs/Input.js";
import { Col } from "../../../layout/FlexBox.js";
import { IsolationFrame } from "../../../overlays/IsolationFrame.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import { ToolbarButton } from "../ToolbarButton.js";

export function LinkControl({
  Overlay,
  disabled,
  value,
  onChange,
  onOpen,
  ...props
}: {
  Overlay: AnchoredOverlay;
  disabled?: boolean | "feedback" | "action";
  value?: Notion.RTF.Link;
  onChange: (link: Notion.RTF.Link) => void;
  onOpen?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Overlay
      open={isOpen}
      onClose={() => setIsOpen(false)}
      content={
        <IsolationFrame>
          <Col p={2}>
            <Input
              type="text"
              label="URL"
              size="m"
              value={value?.url ?? ""}
              onChange={(url) => onChange(url ? { url } : null)}
              onClear={() => onChange(null)}
            />
          </Col>
        </IsolationFrame>
      }
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
