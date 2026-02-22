import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Code } from "../display/Code.js";
import { InlineEditor } from "./InlineEditor.js";

export function CodeBlock({
  block,
  indent = 0,
  editable,
  onEditorChange,
}: {
  block: NotionBlock<"code">;
  indent?: number;
  editable?: boolean;
  onEditorChange?: (block: NotionBlock<"code">) => void;
}) {
  return (
    <Code
      code={Notion.RTF.getContent(block.code.rich_text)}
      language={block.code.language}
      indent={indent}
      // @todo handle changing language and code content
      after={
        block.code.caption.length > 0 && (
          <InlineEditor
            id="caption"
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
        )
      }
    />
  );
}
