/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import {
  act,
  memo,
  Ref,
  RefObject,
  useCallback,
  useImperativeHandle,
} from "react";
import { useEventListener } from "../../../hooks/useEventListener.js";
import { setupUserEvent } from "../../../test-utils/user-event.js";
import { EditorEvent } from "../editor/event.js";
import { ContentEditor } from "../editor/types.js";
import { useContentEditor } from "../editor/use-content-editor.js";
import { PlainTextBlock, usePlainTextPlugin } from "./use-plain-text-plugin.js";

type PlainTextEditorProps = {
  ref?: Ref<ContentEditor<PlainTextBlock> | null>;
  value: PlainTextBlock[];
  onChange: (blocks: PlainTextBlock[]) => void;
};

const TextareaEditor = memo(function PlainTextEditor({
  ref,
  value: initialValue,
  onChange,
}: PlainTextEditorProps) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: usePlainTextPlugin,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  const onCommit = useCallback(
    (e: EditorEvent<PlainTextBlock>) => onChange(e.editor.blocks),
    [onChange],
  );
  useEventListener(editor.bus, "commit", onCommit);

  return (
    <>
      {editor.blocks.map((block) => (
        <textarea
          key={block.id}
          // @note need to use defaultValue instead of value in order to let the
          // text content be handled by the browser.
          defaultValue={block.content}
          {...editable(block)}
        />
      ))}
    </>
  );
});

describe("usePlainTextPlugin", () => {
  it("renders a minimal plain-text editor", () => {
    const blocks = [
      { id: "a", content: "Hello" },
      { id: "b", content: "World" },
    ] satisfies PlainTextBlock[];

    const { container } = render(
      <TextareaEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("textarea"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    expect(first.value).toBe(blocks[0]?.content);
    expect(second.value).toBe(blocks[1]?.content);
  });

  it("updates block content on input", async () => {
    const user = setupUserEvent();
    const blocks = [{ id: "a", content: "hey" }] satisfies PlainTextBlock[];
    const editorRef: RefObject<ContentEditor<PlainTextBlock> | null> = {
      current: null,
    };

    const { container } = render(
      <TextareaEditor ref={editorRef} value={blocks} onChange={() => {}} />,
    );

    const el = container.querySelector("textarea")!;
    expect(el).toBeTruthy();

    await user.click(el);
    await user.type(el, "{ArrowRight}{ArrowRight}{ArrowRight}");
    await user.type(el, "{Backspace}");
    await user.type(el, "llo");

    act(() => {
      editorRef.current?.commit();
    });

    expect(el.value).toBe("hello");
  });
});
