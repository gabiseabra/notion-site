import { Notion } from "@notion-site/common/utils/notion/index.js";
import { memo, ReactNode } from "react";
import { Slot } from "../../utils/slot";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { DocumentToolbar } from "./chrome/DocumentToolbar";
import { FloatingToolbar } from "./chrome/FloatingToolbar";
import {
  NotionPluginOptions,
  useNotionPlugin,
} from "./editable/use-notion-plugin/index.js";
import { ContentEditor } from "./editor/types.js";
import { EditorTargetProvider } from "./editor/use-editor-target.js";

export type Editor = ContentEditor<Notion.Block>;

export type EditorProps = {
  editor: Editor;
  options?: NotionPluginOptions;

  disabled?: boolean;
  readOnly?: boolean;

  before?: Slot<ReactNode, Editor>;
  after?: Slot<ReactNode, Editor>;
};

export const Editor = memo(function ContentEditor({
  editor,
  options,

  disabled,
  readOnly,

  before = (editor) => (
    <>
      {!disabled && !readOnly && (
        <FloatingToolbar editor={editor} disabled={disabled} />
      )}

      {!readOnly && (
        <DocumentToolbar mb={4} editor={editor} disabled={disabled} />
      )}
    </>
  ),
  after,
}: EditorProps) {
  const editable = useNotionPlugin(options)(editor);

  return (
    <EditorTargetProvider editor={editor}>
      <div>
        {Slot.extract(before, editor)}

        <RootBlock
          value={editor.blocks}
          render={(children, block) => (
            <Block
              ref={editor.register(block.id)}
              value={block}
              disabled={disabled}
              readOnly={readOnly}
              editor={editor}
              {...editable(block)}
            >
              {children}
            </Block>
          )}
        />

        {Slot.extract(after, editor)}
      </div>
    </EditorTargetProvider>
  );
});
