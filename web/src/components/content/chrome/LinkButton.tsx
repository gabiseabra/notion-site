import { Notion } from "@notion-site/common/utils/notion/index.js";
import { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import { Input } from "../../inputs/Input.js";
import { Col } from "../../layout/FlexBox.js";
import { IsolationFrame } from "../../overlays/IsolationFrame.js";
import { Popover } from "../../overlays/Popover.js";
import { ToolbarButton } from "./ToolbarButton.js";

export function LinkButton({
  disabled,
  value,
  onChange,
  onOpen: _onOpen,
  onClose: _onClose,
  ...props
}: {
  disabled?: boolean | "feedback" | "action";
  value?: Notion.RTF.Link;
  onChange: (link: Notion.RTF.Link) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const disabledAction = disabled == true || disabled === "action";

  const onToggle = () => {
    const x = !disabledAction && !isOpen;
    setIsOpen(x);
    if (x) _onOpen?.();
    else _onClose?.();
  };
  const onClose = () => {
    setIsOpen(false);
    _onClose?.();
  };

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <Popover
      open={isOpen}
      offset={1}
      placements={["bottom", "left", "right", "top"]}
      onClickOutside={onClose}
      onOffScreen={onClose}
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
      <ToolbarButton disabled={disabled} active={!!value} onClick={onToggle}>
        <FaLink />
      </ToolbarButton>
    </Popover>
  );
}
