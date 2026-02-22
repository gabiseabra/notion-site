import { omit } from "@notion-site/common/utils/object.js";
import { HTMLAttributes } from "react";
import * as css from "../../css/index.js";
import styles from "./Divider.module.scss";

type DividerProps = {
  direction: "x" | "y";
} & HTMLAttributes<HTMLElement> &
  css.MarginProps &
  css.PaddingProps;

export function Divider({ direction, className = "", ...props }: DividerProps) {
  const Component = direction === "x" ? "hr" : "div";

  return (
    <Component
      className={[className, styles[`divider-${direction}`]].join(" ")}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    />
  );
}
