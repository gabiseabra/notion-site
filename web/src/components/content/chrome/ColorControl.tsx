import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { titleCase } from "@notion-site/common/utils/case.js";
import styles from "./Toolbar.module.scss";
import { ToolbarButton } from "./ToolbarButton.js";
import { ToolbarMenu } from "./ToolbarMenu.js";

export function ColorControl({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean | "feedback" | "action";
  value?: zNotion.primitives.api_color;
  onChange: (color: zNotion.primitives.api_color) => void;
}) {
  return (
    <ToolbarMenu
      disabled={disabled === true || disabled === "action"}
      options={colors.map((color) => {
        const isColorActive = color === value;
        const isBackgroundActive = `${color}_background` === value;

        return (
          <ToolbarMenu.Item
            key={color}
            disabled={disabled}
            active={isColorActive || isBackgroundActive}
            color={color}
            onClick={() => onChange(color)}
          >
            {color == "default" ? (
              <div className={styles["bg-color-button"]} />
            ) : (
              <div
                title={`Toggle background color`}
                className={[
                  styles["bg-color-button"],
                  styles[`color-${color}_background`],
                  isBackgroundActive ? styles[`active`] : "",
                ].join(" ")}
                onClick={(e) => {
                  onChange(`${color}_background`);
                  e.stopPropagation();
                }}
              />
            )}

            {titleCase(color)}
          </ToolbarMenu.Item>
        );
      })}
    >
      <ToolbarButton disabled={disabled}>
        <TextColorIcon color={value ?? "default"} />
      </ToolbarButton>
    </ToolbarMenu>
  );
}

function TextColorIcon({
  color,
}: {
  color: zNotion.primitives.api_color | null;
}) {
  return (
    <span
      className={[
        styles["text-color"],
        color ? styles[`color-${color}`] : "",
      ].join(" ")}
    >
      <span className={styles["text-color--bg"]} />
      <span className={styles["text-color--text"]}>A</span>
    </span>
  );
}

const colors = [
  "default",
  "gray",
  "purple",
  "pink",
  "red",
  "blue",
  "green",
  "brown",
  "orange",
  "yellow",
] as const;
