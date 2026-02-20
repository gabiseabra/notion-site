import { ReactNode, useState } from "react";
import { RxCaretUp } from "react-icons/rx";
import styles from "./Accordion.module.scss";
import { IconControl } from "./Icon.js";

type AccordionProps = {
  summary: ReactNode;
  children: ReactNode;
};

export function Accordion({ summary, children }: AccordionProps) {
  const [animating, setAnimating] = useState(false);

  return (
    <details
      className={[styles.accordion, animating ? styles.animating : ""].join(
        " ",
      )}
      onToggle={() => setAnimating(true)}
      onTransitionEnd={(e) => {
        if (e.propertyName !== "block-size") return;
        if (e.currentTarget !== e.target) return;
        setAnimating(false);
      }}
      onTransitionCancel={(e) => {
        if (e.propertyName !== "block-size") return;
        if (e.currentTarget !== e.target) return;
        setAnimating(false);
      }}
    >
      <summary>
        <div className={styles.toggle}>
          <IconControl as="span" size="m" color="currentColor">
            <RxCaretUp />
          </IconControl>
        </div>
        {summary}
      </summary>

      <div className={styles.content}>{children}</div>
    </details>
  );
}
