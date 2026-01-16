import { ReactNode } from "react";
import { match } from "ts-pattern";
import { PiWarningBold, PiWarningCircleBold } from "react-icons/pi";
import { Col } from "../layout/FlexBox.js";
import styles from "./Banner.module.scss";

export type FeedbackType = "warning" | "error";

type BannerProps = {
  type: FeedbackType;
  size: "m" | "l";
  title?: string;
  children: ReactNode;
};

/**
 * Renders an error message or warning.
 * @direction block
 */
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

type AlertProps = {
  type: FeedbackType;
  children: ReactNode;
};

/**
 * Renders a small error message or warning.
 * @direction inline
 */
export function Alert({ type, children }: AlertProps) {
  return (
    <span className={[styles.alert, styles[`type-${type}`]].join(" ")}>
      <BannerIcon type={type} size="s" />

      {children}
    </span>
  );
}

type BannerIcon = {
  type: FeedbackType;
  size: "s" | "m" | "l";
};

function BannerIcon({ type, size }: BannerIcon) {
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
