import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { memo, Ref, useCallback, useImperativeHandle } from "react";
import { useEventListener } from "../../hooks/useEventListener.js";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { useDefaultPlugin } from "./editable/use-default-plugin.js";
import { EditorEvent } from "./editor/event.js";
import {
  ContentEditor as TContentEditor,
  useContentEditor,
} from "./editor/use-content-editor.js";

export type { TContentEditor };

type ContentEditorProps = {
  ref?: Ref<TContentEditor | null>;
  value: zNotion.blocks.block[];
  onChange: (block: zNotion.blocks.block[]) => void;
};

export const ContentEditor = memo(function ContentEditor({
  ref,
  value: initialValue,
  onChange,
}: ContentEditorProps) {
  const editor = useContentEditor({ initialValue });
  const editable = useDefaultPlugin(editor, {});

  useImperativeHandle(ref, () => editor, [editor]);

  const onCommit = useCallback(
    (e: EditorEvent) => onChange(e.editor.blocks),
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
