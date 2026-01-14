import { ReactNode } from "react";
import { match } from "ts-pattern";
import { PiWarningBold, PiWarningCircleBold } from "react-icons/pi";
import { Col } from "./FlexBox.js";
import styles from "./Banner.module.scss";

type BannerProps = {
  type: "warning" | "error";
  size: "s" | "m" | "l";
  title?: string;
  children: ReactNode;
};

export function Banner({ type, size, title, children }: BannerProps) {
  return (
    <div
      className={[
        styles.banner,
        styles[`type-${type}`],
        styles[`size-${size}`],
      ].join(" ")}
    >
      <BannerIcon type={type} size={size} />

      <Col>
        {title && <h4>{title}</h4>}

        {children}
      </Col>
    </div>
  );
}

export function BannerIcon({ type, size }: Pick<BannerProps, "type" | "size">) {
  return (
    <span
      className={[
        styles.icon,
        styles[`type-${type}`],
        styles[`size-${size}`],
      ].join(" ")}
    >
      {match(type)
        .with("warning", () => <PiWarningBold />)
        .with("error", () => <PiWarningCircleBold />)
        .exhaustive()}
    </span>
  );
}
