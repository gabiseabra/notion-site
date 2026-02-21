import { HTMLAttributes } from "react";
import { BsCheck } from "react-icons/bs";
import * as css from "../../css/index.js";
import styles from "./Checkbox.module.scss";

type CheckboxProps = {
  checked?: boolean;
  onToggleChecked?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  indent?: number;
} & Omit<HTMLAttributes<HTMLElement>, "checked">;

export function Checkbox({
  checked,
  onToggleChecked,
  disabled,
  name,
  indent = 0,
  ...props
}: CheckboxProps) {
  return (
    <label className={styles.label} style={{ marginLeft: css.indent(indent) }}>
      <input
        className={styles.input}
        type="checkbox"
        name={name}
        disabled={disabled}
        checked={checked}
        onChange={(e) => onToggleChecked?.(e.currentTarget.checked)}
      />
      <div className={styles.box} aria-hidden="true">
        {checked && <BsCheck />}
      </div>

      <div className={styles.content} {...props} />
    </label>
  );
}
