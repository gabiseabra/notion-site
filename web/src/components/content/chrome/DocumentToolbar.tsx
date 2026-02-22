import { Editor } from "../Editor.js";
import { Toolbar } from "./Toolbar.js";
import styles from "./Toolbar.module.scss";

export function DocumentToolbar({ editor }: { editor: Editor }) {
  return (
    <div className={styles["document-toolbar"]}>
      <Toolbar editor={editor} />
    </div>
  );
}
