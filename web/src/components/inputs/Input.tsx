import { isTruthy } from "@notion-site/common/utils/guards.js";
import { isElementType } from "@testing-library/user-event/dist/cjs/utils/index.js";
import {
  CSSProperties,
  HTMLInputTypeAttribute,
  MouseEvent,
  ReactNode,
} from "react";
import { IoIosClose } from "react-icons/io";
import { IconControl } from "../display/Icon.js";
import styles from "./Input.module.scss";

export type InputProps = {
  as?: "input" | "textarea" | "div";

  type: HTMLInputTypeAttribute;
  label: string;
  hiddenLabel?: boolean;
  size?: "s" | "m" | "l";
  elevation?: 0 | 0.5 | 1;
  className?: string;
  style?: CSSProperties;

  value?: string;
  disabled?: boolean | "feedback" | "action";
  onChange?: (value: string) => void;
  onClear?: () => void;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;

  left?: ReactNode;
  right?: ReactNode;
};

export function Input({
  as: Component = "input",

  label,
  hiddenLabel,
  size = "m",
  elevation = 0,
  className,
  style,

  type,
  value,
  disabled,
  onChange,
  onClear,
  onClick,
  onFocus,
  onBlur,
  placeholder,

  left,
  right,
}: InputProps) {
  return (
    <label
      className={[
        className,
        styles["input-wrapper"],
        styles[`size-${size}`],
        disabled === true && styles["disabled"],
        {
          [0]: "",
          [0.5]: styles["elevation-05"],
          [1]: styles["elevation-1"],
        }[elevation],
      ]
        .filter(isTruthy)
        .join(" ")}
      style={style}
      onClick={disabled ? undefined : onClick}
    >
      {!hiddenLabel && <div className={styles.label}>{label}</div>}

      <div className={styles.input}>
        {left}

        <Component
          type={type}
          value={value}
          disabled={!!disabled}
          onChange={(e) => {
            const element = e.currentTarget;
            onChange?.(
              (isElementType(element, "div")
                ? element.textContent
                : element.value) ?? "",
            );
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
        />

        {!!value && onClear && (
          <IconControl
            as="button"
            color={disabled === true ? "default" : "gray"}
            title={label ? `Clear ${label}` : "Clear search"}
            size={({ s: "xs", m: "s", l: "m" } as const)[size]}
            onClick={disabled ? undefined : onClear}
          >
            <IoIosClose />
          </IconControl>
        )}

        {right}
      </div>
    </label>
  );
}
