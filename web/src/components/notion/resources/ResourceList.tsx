import { ReactNode } from "react";
import styles from "./ResourceList.module.scss";

export function ResourceList<T>({
  items,
  render,
  getItemKey,
  onClick,
  emptyState,
}: {
  items: T[];
  render: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
  onClick?: (item: T) => void;
  emptyState?: ReactNode;
}) {
  if (!items.length) {
    return <div className={styles["list-empty"]}>{emptyState}</div>;
  }

  return (
    <ul
      className={[styles["resource-list"], onClick && styles["clickable"]].join(
        " ",
      )}
    >
      {items.map((item) => (
        <li
          key={getItemKey(item)}
          onClick={
            onClick &&
            ((e) => {
              let element = e.target;

              if (
                element instanceof Element &&
                element.closest("a") &&
                !element.closest("a")?.contains(e.currentTarget)
              ) {
                // If the user clicked on a child <a /> tag, don't trigger onClick
                return;
              }

              onClick(item);
            })
          }
        >
          {render(item)}
        </li>
      ))}
    </ul>
  );
}
