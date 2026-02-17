import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import hljs from "highlight.js";
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
  const html = useMemo(() => {
    return hljs.highlight(code, { language }).value;
  }, [code, language]);

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

      <pre className={["hljs", styles.code].join(" ")}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>

      {after}
    </div>
  );
}
