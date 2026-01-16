import styles from "./Breadcrumbs.module.scss";
import { ReactNode } from "react";

/**
 * @direction block
 */
export function Breadcrumbs({ children }: { children: ReactNode }) {
  return <p className={styles.breadcrumbs}>{children}</p>;
}
