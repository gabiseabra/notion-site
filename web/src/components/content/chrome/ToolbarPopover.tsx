import { ReactNode, useEffect, useState } from "react";
import { Popover } from "../../overlays/Popover.js";

export function ToolbarPopover({
  children,
  content,
  disabled,
}: {
  children: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [!!disabled]);

  return (
    <Popover
      open={isOpen}
      offset={1}
      placements={["bottom", "left", "right", "top"]}
      content={content}
      onClickOutside={() => setIsOpen(false)}
      onOffScreen={() => setIsOpen(false)}
    >
      <span onClick={() => setIsOpen((open) => !disabled && !open)}>
        {children}
      </span>
    </Popover>
  );
}
