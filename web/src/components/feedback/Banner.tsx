import { ReactNode } from "react";
import css from "./Banner.module.scss";
import { match } from "ts-pattern";
import { PiWarningBold, PiWarningCircleBold } from "react-icons/pi";

type BannerProps = {
  type: "warning" | "error";
  children: ReactNode;
};

export function Banner({ type, children }: BannerProps) {
  return (
    <div className={[css.Banner, type].join(" ")}>
      {match(type)
        .with("warning", () => <PiWarningBold />)
        .with("error", () => <PiWarningCircleBold />)
        .exhaustive()}

      {children}
    </div>
  );
}
