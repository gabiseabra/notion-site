import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { Ref } from "react";
import { Code } from "../display/Code.js";
import { CodeEditor } from "./CodeEditor";
import { InlineEditor } from "./InlineEditor.js";

export function CodeBlock({
  // ref,
  block,
  indent = 0,
  editable,
  onEditorChange,
}: {
  ref?: Ref<HTMLElement>;
  block: NotionBlock<"code">;
  indent?: number;
  editable?: boolean;
  onEditorChange?: (block: NotionBlock<"code">) => void;
}) {
  const code = Notion.RTF.getContent(block.code.rich_text);
  const language = block.code.language;
  const prismLanguage = mapLanguage(block.code.language);

  return (
    <Code.Wrapper
      indent={indent}
      badge={
        <Code.LanguageBadge
          language={language}
          right={<Code.CopyButton code={code} />}
        />
      }
    >
      {editable ? (
        <CodeEditor
          id={block.id}
          placeholder="Type some code…"
          readOnly={!editable}
          highlight={(code) =>
            Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage)
          }
          language={prismLanguage}
          code={code}
          onChange={(code) =>
            onEditorChange?.({
              ...block,
              code: {
                ...block.code,
                rich_text: [Notion.RTF.text(code)],
              },
            })
          }
        />
      ) : (
        <Code code={code} language={prismLanguage} />
      )}

      {block.code.caption.length > 0 && (
        <InlineEditor
          id="caption"
          as="p"
          m={0}
          value={block.code.caption}
          disabled={!editable}
          onChange={(rich_text) =>
            onEditorChange?.({
              ...block,
              code: {
                ...block.code,
                rich_text,
              },
            })
          }
        />
      )}
    </Code.Wrapper>
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
