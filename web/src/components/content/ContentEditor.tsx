import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { memo, Ref, useCallback, useImperativeHandle } from "react";
import { useEventListener } from "../../hooks/useEventListener.js";
import { Block } from "./Block.js";
import { RootBlock } from "./RootBlock.js";
import { useContentEditable } from "./hooks/use-content-editable.js";
import {
  EditorEvent,
  ContentEditor as TContentEditor,
  useContentEditor,
} from "./hooks/use-content-editor.js";
import { defaultPlugin } from "./plugin/index.js";

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
  const editable = useContentEditable(editor, defaultPlugin);

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
