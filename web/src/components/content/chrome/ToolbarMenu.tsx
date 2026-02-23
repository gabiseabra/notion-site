import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import {
  Fragment,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Col } from "../../layout/FlexBox.js";
import { Popover } from "../../overlays/Popover.js";
import styles from "./Toolbar.module.scss";

export function ToolbarMenu({
  options,
  disabled,
  children,
}: {
  children: ReactNode;
  options: ReactNode[];
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => setIsOpen((open) => !disabled && !open);
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <Popover
      open={isOpen}
      offset={1}
      placements={["bottom", "left", "right", "top"]}
      onClickOutside={onClose}
      onOffScreen={onClose}
      content={
        <Col gap={0} className={styles["toolbar-menu"]}>
          {options.map((option, ix) => (
            <Fragment key={isValidElement(option) ? (option.key ?? ix) : ix}>
              {option}
            </Fragment>
          ))}
        </Col>
      }
    >
      <span onClick={onToggle}>{children}</span>
    </Popover>
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
