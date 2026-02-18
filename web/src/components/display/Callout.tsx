import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { ReactNode } from "react";
import styles from "./Callout.module.scss";
import { Icon } from "./Icon.js";

type CalloutProps = {
  icon: zNotion.media.icon;
  children: ReactNode;
  background: zNotion.primitives.background_color;
};

export function Callout({ icon, children, background }: CalloutProps) {
  return (
    <section className={[styles.callout, styles[`bg-${background}`]].join(" ")}>
      <Icon size="m" icon={icon} />

      <div>{children}</div>
    </section>
  );
}
