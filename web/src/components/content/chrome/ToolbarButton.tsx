import { ReactNode } from "react";
import { IconControl } from "../../display/Icon.js";

export type ToolbarButtonProps = {
  children: ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
};

export function ToolbarButton({
  children,
  title,
  active,
  disabled,
  readOnly,
  onClick,
}: ToolbarButtonProps) {
  return (
    <IconControl
      as="button"
      size="s"
      m={1}
      color={active ? "blue" : disabled ? "gray" : "default"}
      title={title}
      onClick={!(disabled || readOnly) ? onClick : undefined}
      style={{
        cursor: readOnly ? "not-allowed" : disabled ? "default" : "pointer",
      }}
    >
      {children}
    </IconControl>
  );
}
