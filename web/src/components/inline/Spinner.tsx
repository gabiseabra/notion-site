import styles from "./Spinner.module.scss";

export function Spinner({ size }: { size: "s" | "m" }) {
  return (
    <div className={[styles.spinner, styles[`size-${size}`]].join(" ")}>
      <div />
      <div />
      <div />
    </div>
  );
}
