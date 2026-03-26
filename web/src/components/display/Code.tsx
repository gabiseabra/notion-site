import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { HTMLAttributes, ReactNode, Ref } from "react";
import { FaRegCopy } from "react-icons/fa";
import * as css from "../../css/index.js";
import { highlightCode, mapLanguage, showLanguage } from "../../utils/code";
import { CopyButton } from "../inputs/CopyButton.js";
import { Platform } from "../layout/Platform.js";
import styles from "./Code.module.scss";
import { IconControl } from "./Icon.js";

export function Code({
  code,
  language,
  className,
  ...props
}: {
  ref?: Ref<HTMLPreElement>;
  code: string;
  language: zNotion.blocks.language;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "dangerouslySetInnerHTML">) {
  return (
    <pre
      className={[Code.className(language), className]
        .filter(isTruthy)
        .join(" ")}
      {...props}
    >
      <code
        className={`language-${language}`}
        dangerouslySetInnerHTML={{
          __html: highlightCode(language)(code) + "<br />",
        }}
      />
    </pre>
  );
}

Code.className = (language: zNotion.blocks.language) =>
  [styles.code, "prism", `language-${mapLanguage(language)}`].join(" ");

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
  children,
}: {
  language?: zNotion.blocks.language;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <span className={styles.language}>
      {left && <span className={styles.languageLeft}>{left}</span>}

      {children ? (
        children
      ) : language ? (
        <span className={styles.languageText}>{showLanguage(language)}</span>
      ) : null}

      {right && <span className={styles.languageRight}>{right}</span>}
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
