import { Notion } from "@notion-site/common/utils/notion/index.js";
import { memo, Ref, useCallback, useImperativeHandle } from "react";
import { useEventListener } from "../../hooks/use-event-listener.js";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { useNotionPlugin } from "./editable/use-notion-plugin.js";
import { EditorEvent } from "./editor/event.js";
import { ContentEditor as TContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";

export type { TContentEditor };

type ContentEditorProps = {
  ref?: Ref<TContentEditor<Notion.Block> | null>;
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
};

export const ContentEditor = memo(function ContentEditor({
  ref,
  value: initialValue,
  onChange,
}: ContentEditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: useNotionPlugin,
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
        <Block indent={path.indent} value={block} {...editable(block)} />
      )}
    />
  );
});
