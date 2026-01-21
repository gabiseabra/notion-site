import { ReactNode } from "react";
import styles from "./Breadcrumbs.module.scss";

/**
 * @direction block
 */
export function Breadcrumbs({ children }: { children: ReactNode }) {
  return <p className={styles.breadcrumbs}>{children}</p>;
}
