import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { ReactNode } from "react";
import * as css from "../../css/index.js";
import styles from "./Callout.module.scss";
import { Icon } from "./Icon.js";

type CalloutProps = {
  icon: zNotion.media.icon;
  children: ReactNode;
  background: zNotion.primitives.background_color;
  indent?: number;
};

export function Callout({
  icon,
  children,
  background,
  indent = 0,
}: CalloutProps) {
  return (
    <section
      className={[styles.callout, styles[`bg-${background}`]].join(" ")}
      style={{ paddingLeft: css.indent(indent) }}
    >
      <Icon size="m" icon={icon} />

      <div>{children}</div>
    </section>
  );
}
