import { Notion } from "@notion-site/common/utils/notion/index.js";
import { memo, ReactNode, Ref, useImperativeHandle } from "react";
import { Slot } from "../../utils/slot";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { DocumentToolbar } from "./chrome/DocumentToolbar";
import { FloatingToolbar } from "./chrome/FloatingToolbar";
import {
  NotionPluginOptions,
  useNotionPlugin,
} from "./editable/use-notion-plugin/index.js";
import { EditorTarget } from "./editor/editor-target.js";
import { ContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";
import { EditorTargetProvider } from "./editor/use-editor-target.js";

export type Editor = ContentEditor<Notion.Block>;

export type EditorProps = {
  ref?: Ref<ContentEditor<Notion.Block> | null>;
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
  options?: NotionPluginOptions;
  disabled?: boolean;

  before?: Slot<ReactNode, Editor>;
  after?: Slot<ReactNode, Editor>;
};

export const Editor = memo(function ContentEditor({
  ref,
  value: initialValue,
  onChange,
  options,
  disabled,

  before = (editor) => (
    <>
      <FloatingToolbar editor={editor} />
      <DocumentToolbar mb={4} editor={editor} />
    </>
  ),
  after,
}: EditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: useNotionPlugin(options),
    onCommit: onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <EditorTargetProvider editor={editor}>
      <div>
        {Slot.extract(before, editor)}

        <RootBlock
          value={editor.blocks}
          render={(children, block) => (
            <Block
              value={block}
              editable={!disabled}
              onEditorChange={(block) => {
                const target = EditorTarget.read(editor);
                const selection = target && EditorTarget.extractRange(target);
                editor.push({
                  type: "update",
                  block,
                  selectionAfter:
                    selection?.id === block.id
                      ? selection
                      : { start: 0, end: 0 },
                  selectionBefore: selection ?? undefined,
                });
                editor.commit();
              }}
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
