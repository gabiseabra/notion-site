import css from "./Spinner.module.scss";

export function Spinner({ size }: { size: "s" | "m" }) {
  return (
    <div className={[css.Spinner, `size-${size}`].join(" ")}>
      <div />
      <div />
      <div />
    </div>
  );
}
