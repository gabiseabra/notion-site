import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { titleCase } from "@notion-site/common/utils/case.js";
import { ComponentType, useState } from "react";
import { IconControl } from "../../../display/Icon.js";
import { Text } from "../../../display/Text.js";
import { Row } from "../../../layout/FlexBox.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import { Tooltip } from "../../../overlays/Tooltip.js";
import { ToolbarButton } from "../ToolbarButton.js";
import { ToolbarMenu } from "../ToolbarMenu.js";
import styles from "./ColorControl.module.scss";

type ColorControlProps = {
  disabled?: boolean | "action";
  value?: zNotion.primitives.api_color;
  onChange: (color: zNotion.primitives.api_color) => void;
};

export type ColorControl = ComponentType<ColorControlProps>;

export function ColorControl({
  Overlay,
  Control,
  disabled,
  value,
  onChange,
}: ColorControlProps & {
  Overlay: AnchoredOverlay;
  Control: ColorControl;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Overlay
      open={isOpen}
      onClose={() => setIsOpen(false)}
      content={
        <Control disabled={disabled} value={value} onChange={onChange} />
      }
    >
      <ToolbarButton
        disabled={disabled}
        onClick={() => setIsOpen((open) => !disabled && !open)}
      >
        <ColorControlIcon disabled={disabled} color={value} />
      </ToolbarButton>
    </Overlay>
  );
}

export function MenuColorControl({
  disabled,
  value,
  onChange,
}: ColorControlProps) {
  return (
    <ToolbarMenu>
      {colors.map((color) => {
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
    </ToolbarMenu>
  );
}

export function SwatchColorControl({
  disabled,
  value,
  onChange,
}: ColorControlProps) {
  const isBgEnabled = !!value && value.endsWith("background");
  const currentColor = ((!isBgEnabled ? value : value?.slice(0, -11)) ??
    "default") as zNotion.primitives.color;

  return (
    <Row alignY="center" p={1}>
      <Tooltip
        offset={0.5}
        disabled={!!disabled || currentColor === "default"}
        content={
          <Text as="p" size="caption" m={1}>
            Toggle background color
          </Text>
        }
      >
        <IconControl
          as="span"
          size="xl"
          color="currentColor"
          className={styles["color-swatch-text"]}
          p={1.5}
        >
          <ColorControlIcon
            color={value}
            disabled={disabled || currentColor === "default" ? "action" : false}
            onClick={() =>
              onChange(
                isBgEnabled ? currentColor : `${currentColor}_background`,
              )
            }
          />
        </IconControl>
      </Tooltip>

      <Row flex={1} className={styles["color-swatch-palette"]}>
        {colors.map((color) => (
          <button
            key={color}
            disabled={!!disabled}
            className={[
              styles["color-swatch-button"],
              styles[`color-${color}`],
              value && color === currentColor ? styles["active"] : "",
            ].join(" ")}
            onClick={() =>
              onChange(
                currentColor === color
                  ? "default"
                  : isBgEnabled
                    ? `${color}_background`
                    : color,
              )
            }
          >
            <span>{titleCase(color)}</span>
          </button>
        ))}
      </Row>
    </Row>
  );
}

function ColorControlIcon({
  color,
  disabled,
  onClick,
  onClickText,
  onClickBackground,
}: {
  color?: zNotion.primitives.api_color | null;
  disabled?: boolean | "feedback" | "action";
  onClick?: () => void;
  onClickText?: () => void;
  onClickBackground?: () => void;
}) {
  const isBgEnabled = !!color && color.endsWith("background");
  const currentColor =
    disabled === true || disabled === "feedback"
      ? "gray"
      : (((!isBgEnabled ? color : color?.slice(0, -11)) ??
          "default") as zNotion.primitives.color);

  return (
    <span
      className={[
        styles["text-color"],
        disabled === true || disabled === "feedback" ? styles["disabled"] : "",
        currentColor ? styles[`color-${currentColor}`] : "",
        isBgEnabled ? styles[`background`] : "",
        !!(onClick || onClickText || onClickBackground) &&
        !(disabled === true || disabled === "action")
          ? styles["clickable"]
          : "",
      ].join(" ")}
      onClick={disabled !== true && disabled !== "action" ? onClick : undefined}
    >
      <span
        className={styles["text-color--bg"]}
        onClick={
          disabled !== true && disabled !== "action"
            ? onClickBackground
            : undefined
        }
      />

      <svg
        viewBox="0 0 43.65 48.9"
        xmlns="http://www.w3.org/2000/svg"
        className={styles["text-color--text"]}
        onClick={
          disabled !== true && disabled !== "action" ? onClickText : undefined
        }
      >
        <path
          d={[
            "M 11.25 48.9",
            "L 0 48.9",
            "L 15.225 0",
            "L 28.425 0",
            "L 43.65 48.9",
            "L 31.95 48.9",
            "L 25.65 24.15",
            "Q 24.75 20.475 23.7 16.35",
            "Q 22.65 12.225 21.75 8.4",
            "L 21.45 8.4",
            "Q 20.55 12.225 19.575 16.35",
            "Q 18.6 20.475 17.625 24.15",
            "L 11.25 48.9 Z",
            "M 33.45 37.275",
            "L 10.05 37.275",
            "L 10.05 28.65",
            "L 33.45 28.65",
            "L 33.45 37.275 Z",
          ].join(" ")}
        />
      </svg>
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
