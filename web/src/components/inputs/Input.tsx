import { isTruthy } from "@notion-site/common/utils/guards.js";
import { isElementType } from "@testing-library/user-event/dist/cjs/utils/index.js";
import { ReactNode } from "react";
import { IoIosClose } from "react-icons/io";
import { IconControl } from "../display/Icon.js";
import styles from "./Input.module.scss";

type InputProps = {
  as?: "input" | "textarea" | "div";

  type: "search" | "text";
  label: string;
  hiddenLabel?: boolean;
  size?: "s" | "m" | "l";
  elevation?: 0 | 0.5 | 1;

  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
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

  type,
  value,
  onChange,
  onClear,
  placeholder,

  left,
  right,
}: InputProps) {
  return (
    <label
      className={[
        styles["input-wrapper"],
        styles[`size-${size}`],
        {
          [0]: "",
          [0.5]: styles["elevation-05"],
          [1]: styles["elevation-1"],
        }[elevation],
      ]
        .filter(isTruthy)
        .join(" ")}
    >
      {!hiddenLabel && <div className={styles.label}>{label}</div>}

      <div className={styles.input}>
        {left}

        <Component
          type={type}
          value={value}
          contentEditable={Component === "div" && !!onChange}
          suppressContentEditableWarning
          onChange={(e) => {
            const element = e.currentTarget;
            onChange?.(
              (isElementType(element, "div")
                ? element.textContent
                : element.value) ?? "",
            );
          }}
          placeholder={placeholder}
        />

        {!!value && onClear && (
          <IconControl
            as="button"
            color="default"
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
