import { useState } from "react";
import { Popover, PopoverProps } from "./Popover.js";

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
      onPointerEnter={onOpen}
      onPointerLeave={onClose}
      onTouchStart={onOpen}
      onTouchMove={onOpen}
      onTouchEnd={onClose}
      onTouchCancel={onClose}
      style={{ userSelect: "none" }}
    >
      <Popover
        role="tooltip"
        open={isOpen}
        onClickOutside={onClose}
        onOffScreen={onClose}
        {...props}
      />
    </span>
  );
}
