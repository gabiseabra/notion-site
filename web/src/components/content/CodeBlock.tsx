import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Ref } from "react";
import { Code } from "../display/Code.js";
import { LanguageDropdown } from "../inputs/LanguageDropdown";
import { CodeEditor } from "./CodeEditor";
import { InlineEditor } from "./InlineEditor.js";
import { useTextIndentPlugin } from "./editable/use-text-plugin/use-text-indent-plugin";

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
  const language = block.code.language;
  const code = Notion.RTF.getContent(block.code.rich_text);

  return (
    <Code.Wrapper
      indent={indent}
      badge={
        editable ? (
          <Code.LanguageBadge>
            <LanguageDropdown
              value={language}
              onChange={(language) =>
                onEditorChange?.({
                  ...block,
                  code: {
                    ...block.code,
                    language,
                  },
                })
              }
            />
          </Code.LanguageBadge>
        ) : (
          <Code.LanguageBadge
            language={language}
            right={<Code.CopyButton code={code} />}
          />
        )
      }
    >
      {editable ? (
        <CodeEditor
          id={block.id}
          placeholder="Type some code…"
          readOnly={!editable}
          language={language}
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
        <Code code={useTextIndentPlugin.normalize(code)} language={language} />
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
