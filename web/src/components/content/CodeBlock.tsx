import type { Block as NotionBlock } from "@notion-site/common/utils/notion/block.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Code } from "../display/Code.js";
import { InlineContentEditor } from "./InlineContentEditor.js";

export function CodeBlock({
  block,
  editable,
  onEditorChange,
}: {
  block: NotionBlock<"code">;
  editable?: boolean;
  onEditorChange?: (block: NotionBlock<"code">) => void;
}) {
  return (
    <Code
      code={Notion.RTF.getContent(block.code.rich_text)}
      language={block.code.language}
      // @todo handle changing language and code content
      after={
        block.code.caption.length > 0 && (
          <InlineContentEditor
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
