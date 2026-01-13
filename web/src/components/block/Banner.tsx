import { ReactNode } from "react";
import { match } from "ts-pattern";
import { PiWarningBold, PiWarningCircleBold } from "react-icons/pi";
import styles from "./Banner.module.scss";

type BannerProps = {
  type: "warning" | "error";
  children: ReactNode;
};

export function Banner({ type, children }: BannerProps) {
  return (
    <div className={[styles.banner, styles[`type-${type}`]].join(" ")}>
      <BannerIcon type={type} />

      {children}
    </div>
  );
}

export function BannerIcon({ type }: Pick<BannerProps, "type">) {
  return (
    <span className={[styles.icon, styles[`type-${type}`]].join(" ")}>
      {match(type)
        .with("warning", () => <PiWarningBold />)
        .with("error", () => <PiWarningCircleBold />)
        .exhaustive()}
    </span>
  );
}
