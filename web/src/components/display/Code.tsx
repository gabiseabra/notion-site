import { ReactNode, Ref } from "react";
import { FaRegCopy } from "react-icons/fa";
import * as css from "../../css/index.js";
import { CopyButton } from "../inputs/CopyButton.js";
import { Platform } from "../layout/Platform.js";
import styles from "./Code.module.scss";
import { IconControl } from "./Icon.js";

export function Code({ code, language }: { code: string; language: string }) {
  return (
    <pre className={Code.className(language)}>
      <code
        className={`language-${language}`}
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </pre>
  );
}

Code.className = (language: string) =>
  [styles.code, "prism", `language-${language}`].join(" ");

Code.Wrapper = function CodeWrapper({
  ref,
  badge,
  indent = 0,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  badge?: ReactNode;
  indent?: number;
  children: ReactNode;
}) {
  return (
    <div
      ref={ref}
      className={styles.wrapper}
      style={{ marginLeft: css.indent(indent) }}
    >
      <Platform.Web>
        <div className={styles.badge}>{badge}</div>
      </Platform.Web>

      {children}
    </div>
  );
};

Code.LanguageBadge = function CodeLanguageBadge({
  language,
  left,
  right,
}: {
  language: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <span className={styles.language}>
      {left}

      {language}

      {right}
    </span>
  );
};

Code.CopyButton = function CodeCopyButton({ code }: { code: string }) {
  return (
    <CopyButton as="button" copyText={code}>
      <IconControl as="span" size="xs" color="currentColor">
        <FaRegCopy />
      </IconControl>
    </CopyButton>
  );
};
