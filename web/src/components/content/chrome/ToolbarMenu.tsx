import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { Fragment, isValidElement, ReactNode } from "react";
import { Col } from "../../layout/FlexBox.js";
import styles from "./ToolbarMenu.module.scss";

export function ToolbarMenu({ children }: { children: ReactNode[] }) {
  return (
    <Col gap={0} className={styles["toolbar-menu"]}>
      {children.map((option, ix) => (
        <Fragment key={isValidElement(option) ? (option.key ?? ix) : ix}>
          {option}
        </Fragment>
      ))}
    </Col>
  );
}

ToolbarMenu.Item = function ToolbarMenuItem({
  children,
  color,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;
  color?: zNotion.primitives.color;
  active?: boolean;
  disabled?: boolean | "feedback" | "action";
  onClick?: () => void;
}) {
  return (
    <button
      className={[
        styles["toolbar-menu-item"],
        color && styles[`color-${color}`],
        active && styles["active"],
        (disabled === true || disabled === "feedback") && styles["disabled"],
        disabled !== "action" && styles["clickable"],
      ]
        .filter(isTruthy)
        .join(" ")}
      onClick={
        disabled === false || disabled !== "action" ? onClick : undefined
      }
    >
      {children}
    </button>
  );
};
