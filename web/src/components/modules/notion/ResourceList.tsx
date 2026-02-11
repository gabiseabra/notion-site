import { ReactNode } from "react";
import { isEventFromMatchingDescendant } from "../../../utils/event.js";
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
              if (!isEventFromMatchingDescendant(e, "a")) {
                onClick(item);
              }
            })
          }
        >
          {render(item)}
        </li>
      ))}
    </ul>
  );
}
