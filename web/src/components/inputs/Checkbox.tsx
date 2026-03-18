import { isTruthy } from "@notion-site/common/utils/guards.js";
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
    <label
      className={[styles.label, props.contentEditable && styles.editable]
        .filter(isTruthy)
        .join(" ")}
      style={{ marginLeft: css.indent(indent) }}
      onClick={(e) => {
        if (props.contentEditable) {
          e.preventDefault();
        }
      }}
    >
      <input
        className={styles.input}
        type="checkbox"
        name={name}
        disabled={disabled}
        checked={checked}
        onChange={(e) => onToggleChecked?.(e.currentTarget.checked)}
      />
      <div
        className={styles.box}
        aria-hidden="true"
        onClick={() => {
          if (props.contentEditable) {
            onToggleChecked?.(!checked);
          }
        }}
      >
        {checked && <BsCheck />}
      </div>

      <p className={styles.content} {...props} />
    </label>
  );
}
