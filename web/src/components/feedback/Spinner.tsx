import css from "./Spinner.module.scss";

export function Spinner({ size }: { size: "s" | "m" | "l" }) {
  return <div className={[css.Spinner, `size-${size}`].join(" ")} />;
}
