import { useRef, useState } from "react";
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

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  if (disabled) return <>{props.children}</>;

  const onOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const onClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = null;
    setIsOpen(false);
  };

  return (
    <span
      onPointerEnter={onOpen}
      onPointerLeave={onClose}
      onTouchStart={onOpen}
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
