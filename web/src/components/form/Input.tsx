import { ReactNode } from "react";
import { isEventFromMatchingDescendant } from "../../utils/event.js";
import styles from "./Input.module.scss";
import { IconButton } from "../typography/IconButton.js";
import { IoIosClose } from "react-icons/io";

type InputProps = {
  type: "search" | "text";
  label?: string;
  hiddenLabel?: boolean;
  size?: "m" | "l";

  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;

  left?: ReactNode;
  right?: ReactNode;
};

export function Input({
  label,
  hiddenLabel,
  size = "m",
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
      className={[styles["input-wrapper"], styles[`size-${size}`]].join(" ")}
    >
      {!!label && !hiddenLabel && <div className={styles.label}>{label}</div>}

      <div
        className={styles.input}
        onClick={(e) => {
          if (
            !isEventFromMatchingDescendant(e, "a") &&
            !isEventFromMatchingDescendant(e, "button") &&
            !isEventFromMatchingDescendant(e, "input")
          ) {
            e.currentTarget.querySelector("input")?.focus();
          }
        }}
      >
        {left}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          placeholder={placeholder}
        />

        {!!value && type === "search" && onClear && (
          <IconButton
            as="button"
            title={label ? `Clear ${label}` : "Clear search"}
            size={({ m: "s", l: "m" } as const)[size]}
            onClick={onClear}
          >
            <IoIosClose />
          </IconButton>
        )}

        {right}
      </div>
    </label>
  );
}
