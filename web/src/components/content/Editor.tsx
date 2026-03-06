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
import { ContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";

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
    onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <div>
      <FloatingToolbar editor={editor} />

      <DocumentToolbar editor={editor} />

      <RootBlock
        value={editor.blocks}
        render={(children, block) => (
          <Block
            value={block}
            editable={!disabled}
            onEditorChange={editor.update}
            {...editable(block)}
          >
            {children}
          </Block>
        )}
      />
    </div>
  );
});
