import { Notion } from "@notion-site/common/utils/notion/index.js";
import { memo, Ref, useCallback, useImperativeHandle } from "react";
import { useEventListener } from "../../hooks/use-event-listener.js";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import {
  NotionPluginOptions,
  useNotionPlugin,
} from "./editable/use-notion-plugin.js";
import { EditorEvent } from "./editor/editor-event.js";
import { ContentEditor as TContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";

export namespace ContentEditor {
  export type Editor = TContentEditor<Notion.Block>;
  export type Props = {
    ref?: Ref<TContentEditor<Notion.Block> | null>;
    value: Notion.Block[];
    onChange: (block: Notion.Block[]) => void;
    options?: NotionPluginOptions;
    disabled?: boolean;
  };
}

export const ContentEditor = memo(function ContentEditor({
  ref,
  value: initialValue,
  onChange,
  options,
  disabled,
}: ContentEditor.Props) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: useNotionPlugin(options),
  });

  useImperativeHandle(ref, () => editor, [editor]);

  const onCommit = useCallback(
    (e: EditorEvent<Notion.Block>) => onChange(e.editor.blocks),
    [onChange],
  );
  useEventListener(editor.bus, "commit", onCommit);

  return (
    <RootBlock
      value={editor.blocks}
      render={(block, path) => (
        <Block
          indent={path.indent}
          value={block}
          editable={!disabled}
          {...editable(block)}
        />
      )}
    />
  );
});
