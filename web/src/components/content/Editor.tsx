import { Notion } from "@notion-site/common/utils/notion/index.js";
import { memo, Ref, useImperativeHandle } from "react";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { DocumentToolbar } from "./chrome/DocumentToolbar.js";
import { FloatingToolbar } from "./chrome/FloatingToolbar.js";
import {
  NotionPluginOptions,
  useNotionPlugin,
} from "./editable/notion/use-notion-plugin.js";
import { EditorSelection } from "./editor/editor-selection.js";
import { ContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";
import { EditorSelectionProvider } from "./editor/use-editor-selection.js";

export type Editor = ContentEditor<Notion.Block>;

export type EditorProps = {
  ref?: Ref<ContentEditor<Notion.Block> | null>;
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
  options?: NotionPluginOptions;
  disabled?: boolean;
};

export const Editor = memo(function ContentEditor({
  ref,
  value: initialValue,
  onChange,
  options,
  disabled,
}: EditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: useNotionPlugin(options),
    onCommit: onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <EditorSelectionProvider editor={editor}>
      <div>
        <FloatingToolbar editor={editor} />

        <DocumentToolbar mb={4} editor={editor} />

        <RootBlock
          value={editor.blocks}
          render={(children, block) => (
            <Block
              value={block}
              editable={!disabled}
              onEditorChange={(block) => {
                const selection = EditorSelection.read(editor);
                editor.update(block, {
                  selectionAfter:
                    selection?.id === block.id
                      ? selection
                      : {
                          start: 0,
                          end: 0,
                          id: block.id,
                        },
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
      </div>
    </EditorSelectionProvider>
  );
});
