import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p } from "@notion-site/common/utils/notion/wip.js";
import { memo, Ref, useImperativeHandle } from "react";
import { Text, TextProps } from "../display/Text.js";
import { richTextToHTML } from "./Block.js";
import { RichText } from "./RichText.js";
import {
  NotionPluginOptions,
  useNotionPlugin,
} from "./editable/notion/use-notion-plugin.js";
import { ContentEditor as TContentEditor } from "./editor/types.js";
import { useContentEditor } from "./editor/use-content-editor.js";

export type InlineEditorProps = {
  id: string;
  ref?: Ref<TContentEditor<Notion.Block> | null>;
  value: Notion.RichText;
  onChange: (block: Notion.RichText) => void;
  options?: Omit<NotionPluginOptions, "multiline">;
  disabled?: boolean;
} & Omit<TextProps, "children" | "onChange">;

export const InlineEditor = memo(function InlineEditor({
  id,
  ref,
  value: initialValue,
  onChange,
  options,
  disabled,
  ...props
}: InlineEditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue: [p(id, ...initialValue)],
    plugin: useNotionPlugin(options),
    onCommit: (blocks) =>
      onChange(blocks.flatMap(Notion.Block.extractRichText)),
  });

  useImperativeHandle(ref, () => editor, [editor]);

  const rich_text = editor.blocks.flatMap(Notion.Block.extractRichText);

  return (
    <Text
      {...(disabled
        ? {
            children: <RichText value={rich_text} />,
          }
        : {
            tabIndex: 1,
            contentEditable: "plaintext-only" as const,
            suppressContentEditableWarning: true,
            dangerouslySetInnerHTML: {
              __html: richTextToHTML(rich_text),
            },
            ...editable(p(id, ...rich_text)),
          })}
      {...props}
    />
  );
});
