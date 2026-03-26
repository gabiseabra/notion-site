import { memo, Ref, useImperativeHandle } from "react";
import * as css from "../../css/index.js";
import { Code } from "../display/Code";
import { composePlugins } from "./editable/compose-plugins";
import { TextBlock, useTextPlugin } from "./editable/use-text-plugin";
import { useTextIndentPlugin } from "./editable/use-text-plugin/use-text-indent-plugin";
import { ContentEditor } from "./editor/types";
import { useContentEditor } from "./editor/use-content-editor";

export type CodeEditorProps = {
  id: string;
  ref?: Ref<ContentEditor<TextBlock>>;
  highlight: (code: string) => string;
  language: string;
  code: string;
  onChange?: (code: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
};

const useCodePlugin = composePlugins(
  useTextPlugin({ autoCommit: true }),
  useTextIndentPlugin(),
);

export const CodeEditor = memo(function CodeEditor({
  id,
  ref,
  highlight,
  language,
  code: initialValue,
  onChange,
  ...props
}: CodeEditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue: [TextBlock.create(id, initialValue)],
    plugin: useCodePlugin,
    onCommit: (blocks) => onChange?.(TextBlock.extract(blocks)),
  });

  const code = TextBlock.extract(editor.blocks);

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <div
      style={{
        position: "relative",
        marginBlock: css.space(1),
      }}
    >
      <Code
        language={language}
        code={code}
        highlight={highlight}
        aria-hidden="true"
        style={{
          margin: 0,
        }}
      />

      <textarea
        value={code}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-gramm={false}
        className={Code.className(language)}
        {...editable(TextBlock.create(id, code))}
        {...props}
        style={{
          margin: 1,
          border: 0,
          background: "none",
          boxSizing: "border-box",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          resize: "none",
          color: "inherit",
          overflow: "hidden",
          MozOsxFontSmoothing: "grayscale",
          ...(!code
            ? {}
            : {
                WebkitFontSmoothing: "antialiased",
                WebkitTextFillColor: "transparent",
              }),
        }}
      />
    </div>
  );
});
