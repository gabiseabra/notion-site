import { isTruthy } from "@notion-site/common/utils/guards.js";
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
  variant?: "default" | "transparent";
  size?: "s" | "m" | "l";
  elevation?: 0 | 0.5 | 1;
  className?: string;
  style?: CSSProperties;

  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
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
  variant = "default",
  size = "m",
  elevation = 0,
  className,
  style,

  type,
  value,
  disabled,
  readOnly,
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
        styles[`variant-${variant}`],
        disabled && styles["disabled"],
        {
          [0]: "",
          [0.5]: styles["elevation-05"],
          [1]: styles["elevation-1"],
        }[elevation],
      ]
        .filter(isTruthy)
        .join(" ")}
      style={style}
      onClick={disabled || readOnly ? undefined : onClick}
    >
      {!hiddenLabel && <div className={styles.label}>{label}</div>}

      <div className={styles.input}>
        {left}

        <Component
          type={type}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            const element = e.currentTarget;
            onChange?.(
              (element instanceof HTMLDivElement
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
            disabled={disabled}
            readOnly={readOnly}
            color={disabled === true ? "default" : "gray"}
            title={label ? `Clear ${label}` : "Clear search"}
            size={({ s: "xs", m: "s", l: "m" } as const)[size]}
            onClick={onClear}
          >
            <IoIosClose />
          </IconControl>
        )}

        {right}
      </div>
    </label>
  );
}
