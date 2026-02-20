import { ReactNode } from "react";
import { RxCaretUp } from "react-icons/rx";
import styles from "./Accordion.module.scss";
import { IconControl } from "./Icon.js";

type AccordionProps = {
  summary: ReactNode;
  children: ReactNode;
};

export function Accordion({ summary, children }: AccordionProps) {
  return (
    <details className={styles.accordion}>
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
