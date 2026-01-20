import { PopoverProps, Popover } from "./Popover.js";
import { useState } from "react";

export type TooltipProps = Omit<PopoverProps, "open" | "role">;

export function Tooltip(props: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <Popover role="tooltip" open={isOpen} {...props} />
    </span>
  );
}
