import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { titleCase } from "@notion-site/common/utils/case.js";
import { ComponentType, useState } from "react";
import { IconControl } from "../../../display/Icon.js";
import { Row } from "../../../layout/FlexBox.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import { ToolbarButton } from "../ToolbarButton.js";
import { ToolbarMenu } from "../ToolbarMenu.js";
import styles from "./ColorControl.module.scss";

type ColorControlProps = {
  disabled?: boolean | "feedback" | "action";
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
      <ToolbarButton disabled={disabled} onClick={() => setIsOpen(!disabled)}>
        <ColorControlIcon color={value} />
      </ToolbarButton>
    </Overlay>
  );
}

ColorControl.Menu = function ColorControlMenu({
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
};

ColorControl.Swatch = function ColorControlSwatch({
  disabled,
  value,
  onChange,
}: ColorControlProps) {
  const isBgEnabled = !!value && value.endsWith("background");
  const currentColor = ((isBgEnabled ? value : value?.slice(0, -11)) ??
    "default") as zNotion.primitives.color;

  console.log(value, currentColor);
  return (
    <Row alignY="center" p={1}>
      <IconControl
        as="span"
        size="l"
        color="currentColor"
        className={styles["color-swatch-text"]}
      >
        <ColorControlIcon
          color={value}
          onClickText={() => onChange(isBgEnabled ? currentColor : "default")}
          onClickBackground={() =>
            onChange(isBgEnabled ? currentColor : `${currentColor}_background`)
          }
        />
      </IconControl>

      <Row flex={1} className={styles["color-swatch-palette"]}>
        {colors.map((color) => (
          <button
            key={color}
            disabled={!!disabled}
            className={[
              styles["color-swatch-button"],
              styles[`color-${color}`],
              color === currentColor ? styles["active"] : "",
            ].join(" ")}
            onClick={() =>
              onChange(
                !isBgEnabled && currentColor === color
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
};

function ColorControlIcon({
  color,
  onClickText,
  onClickBackground,
}: {
  color?: zNotion.primitives.api_color | null;
  onClickText?: () => void;
  onClickBackground?: () => void;
}) {
  return (
    <span
      className={[
        styles["text-color"],
        color ? styles[`color-${color}`] : "",
        !!(onClickText || onClickBackground) ? styles["clickable"] : "",
      ].join(" ")}
    >
      <span className={styles["text-color--bg"]} onClick={onClickBackground} />

      <svg
        viewBox="0 0 43.65 48.9"
        xmlns="http://www.w3.org/2000/svg"
        className={styles["text-color--text"]}
        onClick={onClickText}
      >
        <path d="M 11.25 48.9 L 0 48.9 L 15.225 0 L 28.425 0 L 43.65 48.9 L 31.95 48.9 L 25.65 24.15 Q 24.75 20.475 23.7 16.35 Q 22.65 12.225 21.75 8.4 L 21.45 8.4 Q 20.55 12.225 19.575 16.35 Q 18.6 20.475 17.625 24.15 L 11.25 48.9 Z M 33.45 37.275 L 10.05 37.275 L 10.05 28.65 L 33.45 28.65 L 33.45 37.275 Z" />
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
