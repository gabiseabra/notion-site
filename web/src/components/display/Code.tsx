import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { ReactNode, useMemo } from "react";
import { FaRegCopy } from "react-icons/fa";
import { CopyButton } from "../inputs/CopyButton.js";
import styles from "./Code.module.scss";
import { IconControl } from "./Icon.js";

type CodeProps = {
  code: string;
  language: zNotion.blocks.language;
  before?: ReactNode;
  after?: ReactNode;
};

export function Code({ code, language, before, after }: CodeProps) {
  const prismLang = mapLanguage(language);

  const html = useMemo(() => {
    const grammar = Prism.languages[prismLang] ?? Prism.languages.markup;
    return Prism.highlight(code, grammar, prismLang);
  }, [code, prismLang]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.language}>
        {language}
        <CopyButton as="button" copyText={code}>
          <IconControl as="span" size="xs" color="currentColor">
            <FaRegCopy />
          </IconControl>
        </CopyButton>
      </span>

      {before}

      <pre
        className={[styles.code, "prism", `language-${prismLang}`].join(" ")}
      >
        <code
          className={`language-${prismLang}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>

      {after}
    </div>
  );
}

function mapLanguage(language: zNotion.blocks.language) {
  switch (language) {
    case "plain text":
      return "none";
    case "typescript":
      return "tsx";
    default:
      return language;
  }
}
