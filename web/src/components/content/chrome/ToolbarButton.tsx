import { ReactNode } from "react";
import { IconControl } from "../../display/Icon.js";

export type ToolbarButtonProps = {
  children: ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean | "action";
  onClick?: () => void;
};

export function ToolbarButton({
  children,
  title,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <IconControl
      as="button"
      size="s"
      m={1}
      color={active ? "blue" : disabled === true ? "gray" : "default"}
      title={title}
      onClick={
        disabled === false || disabled !== "action" ? onClick : undefined
      }
      style={{
        cursor:
          disabled === "action"
            ? "not-allowed"
            : disabled === false
              ? "pointer"
              : "default",
      }}
    >
      {children}
    </IconControl>
  );
}
