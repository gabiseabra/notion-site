import { ReactNode } from "react";
import css from "./Banner.module.scss";
import { match } from "ts-pattern";
import { GrStatusCritical, GrStatusWarning } from "react-icons/gr";

type BannerProps = {
  type: "warning" | "error";
  children: ReactNode;
};

export function Banner({ type, children }: BannerProps) {
  return (
    <div className={[css.Banner, type].join(" ")}>
      {match(type)
        .with("warning", () => <GrStatusWarning />)
        .with("error", () => <GrStatusCritical />)
        .exhaustive()}

      {children}
    </div>
  );
}
