import { PopoverProps, Popover } from "./Popover.js";
import { useState } from "react";

export type TooltipProps = Omit<
  PopoverProps,
  "open" | "role" | "onOffScreen" | "onClickOutside"
> & {
  disabled?: boolean;
  delay?: number;
};

export function Tooltip({ disabled, delay = 300, ...props }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openTimeout, setOpenTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  if (disabled) return <>{props.children}</>;

  const onOpen = () => {
    if (openTimeout) clearTimeout(openTimeout);

    setOpenTimeout(
      setTimeout(() => {
        setIsOpen(true);
      }, delay),
    );
  };

  const onClose = () => {
    if (openTimeout) clearTimeout(openTimeout);

    setIsOpen(false);
  };

  return (
    <span
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={onClose}
    >
      <Popover
        role="tooltip"
        open={isOpen}
        onOffScreen={() => setIsOpen(false)}
        {...props}
      />
    </span>
  );
}
