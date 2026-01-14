import styles from "./Spinner.module.scss";

export function Spinner({ size }: { size: "s" | "m" | "l" }) {
  return (
    <span className={[styles.spinner, styles[`size-${size}`]].join(" ")}>
      <span />
      <span />
      <span />
    </span>
  );
}
