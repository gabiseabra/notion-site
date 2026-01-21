import { PopoverProps, Popover } from "./Popover.js";
import { useState } from "react";

export type TooltipProps = Omit<PopoverProps, "open" | "role"> & {
  disabled?: boolean;
};

export function Tooltip({ disabled, ...props }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) return <>{props.children}</>;

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
