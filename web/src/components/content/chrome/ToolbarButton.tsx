import { ReactNode } from "react";
import { IconControl } from "../../display/Icon.js";

export function ToolbarButton({
  children,
  title,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean | "action" | "feedback";
  onClick?: () => void;
}) {
  return (
    <IconControl
      as="button"
      size="s"
      p={1}
      color={
        active
          ? "blue"
          : disabled === true || disabled == "feedback"
            ? "gray"
            : "default"
      }
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
