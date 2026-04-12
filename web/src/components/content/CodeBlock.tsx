import { WithRequired } from "@notion-site/common/types/object.js";
import { isNonNullable } from "@notion-site/common/utils/guards.js";
import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Lens } from "@notion-site/common/utils/optics/lens.js";
import { Prism } from "@notion-site/common/utils/optics/prism.js";
import { pipe } from "ts-functional-pipe";
import { normalizeIndent } from "../../utils/code";
import { Code } from "../display/Code.js";
import { Text } from "../display/Text";
import { LanguageDropdown } from "../inputs/LanguageDropdown";
import { CodeEditor } from "./CodeEditor";
import {
  downgradeBlock,
  updateCodeLanguage,
} from "./editable/use-notion-plugin/commands";
import { TextBlock } from "./editable/use-text-plugin";
import { Editor } from "./Editor";
import { useEditorLens } from "./editor/use-editor-lens";
import { RichText } from "./RichText";

type CodeBlockProps = {
  block: NotionBlock<"code">;
  indent?: number;
  editor?: Editor;
  disabled?: boolean;
  readOnly?: boolean;
};

export function CodeBlock({ editor, readOnly, ...props }: CodeBlockProps) {
  if (editor && !readOnly) {
    return <EditableCodeBlock editor={editor} {...props} />;
  } else {
    return <ReadOnlyCodeBlock {...props} />;
  }
}

function EditableCodeBlock({
  block,
  indent = 0,
  editor,
  disabled,
}: WithRequired<Omit<CodeBlockProps, "readOnly">, "editor">) {
  const language = block.code.language;

  const codeEditor = useEditorLens({
    id: block.id,
    editor,
    lens: Lens.compose(
      Prism.compose(
        Notion.Lens.code,
        Lens.from("value", { id: "code", value: "" }),
      ) as Lens<NotionBlock, TextBlock | undefined>,
      {
        get: (block) => [block].filter(isNonNullable),
        set: (_, [block]) => block,
      },
    ),
  });

  return (
    <Code.Wrapper
      indent={indent}
      badge={
        <Code.LanguageBadge>
          <LanguageDropdown
            disabled={disabled}
            value={language}
            onChange={pipe(updateCodeLanguage, editor.exec)}
          />
        </Code.LanguageBadge>
      }
    >
      <CodeEditor
        id="code"
        placeholder="Type some code…"
        disabled={disabled}
        language={language}
        editor={codeEditor}
        onDelete={() => editor.exec(downgradeBlock(block, "code"))}
      />
    </Code.Wrapper>
  );
}

function ReadOnlyCodeBlock({
  block,
  indent = 0,
  disabled,
}: Omit<CodeBlockProps, "editor" | "readOnly">) {
  const language = block.code.language;
  const code = Notion.RTF.getContent(block.code.rich_text);

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
      <Code
        code={normalizeIndent(code, { tabCharacter: "  " })}
        language={language}
      />

      {block.code.caption.length > 0 && (
        <Text as="p" m={0} disabled={disabled}>
          <RichText value={block.code.caption} />
        </Text>
      )}
    </Code.Wrapper>
  );
}
