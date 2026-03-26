import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { pipe } from "ts-functional-pipe";
import { Code } from "../display/Code.js";
import { LanguageDropdown } from "../inputs/LanguageDropdown";
import { CodeEditor } from "./CodeEditor";
import {
  updateCode,
  updateCodeCaption,
  updateCodeLanguage,
} from "./editable/use-notion-plugin/commands";
import { useTextIndentPlugin } from "./editable/use-text-plugin/use-text-indent-plugin";
import { Editor } from "./Editor";
import { InlineEditor } from "./InlineEditor.js";

export function CodeBlock({
  block,
  indent = 0,
  editor,
  disabled,
  readOnly = !editor,
}: {
  block: NotionBlock<"code">;
  indent?: number;
  editor?: Editor;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const language = block.code.language;
  const code = Notion.RTF.getContent(block.code.rich_text);

  return (
    <Code.Wrapper
      indent={indent}
      badge={
        !readOnly && editor ? (
          <Code.LanguageBadge>
            <LanguageDropdown
              disabled={disabled}
              value={language}
              onChange={pipe(updateCodeLanguage, editor.exec)}
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
      {!readOnly && editor ? (
        <CodeEditor
          id={block.id}
          placeholder="Type some code…"
          disabled={disabled}
          language={language}
          value={code}
          onChange={pipe(updateCode, editor.exec)}
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
          disabled={disabled}
          readOnly={readOnly}
          onChange={editor && pipe(updateCodeCaption, editor.exec)}
        />
      )}
    </Code.Wrapper>
  );
}
