/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { act, Ref, RefObject, useImperativeHandle } from "react";
import { EditorEvent } from "../editor/editor-event.js";
import { ContentEditor } from "../editor/types.js";
import { useContentEditor } from "../editor/use-content-editor.js";
import { useLoggerPlugin } from "./use-logger-plugin.js";

type TestBlock = { id: string; content: string };

function TestEditor({
  ref,
  value: initialValue,
  log,
}: {
  ref?: Ref<ContentEditor<TestBlock>>;
  value: TestBlock[];
  log: (event: EditorEvent<TestBlock>) => void;
}) {
  const { editor, editable } = useContentEditor({
    initialValue,
    plugin: useLoggerPlugin(log),
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return (
    <>
      {editor.blocks.map((block) => (
        <div
          key={block.id}
          contentEditable={"plaintext-only"}
          suppressContentEditableWarning={true}
          tabIndex={0}
          {...editable(block)}
        >
          {block.content}
        </div>
      ))}
    </>
  );
}

describe("useLoggerPlugin", () => {
  it("logs ready event on initial render", () => {
    const log = jest.fn();
    const blocks = [{ id: "a", content: "Hello" }];

    render(<TestEditor value={blocks} log={log} />);

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "ready" }),
    );
  });

  it("logs edit and commit events when editor commits changes", () => {
    const log = jest.fn();
    const blocks = [{ id: "a", content: "Hello" }];
    const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
      current: null,
    };

    render(<TestEditor ref={editorRef} value={blocks} log={log} />);
    log.mockClear();

    act(() => {
      editorRef.current?.update({ id: "a", content: "World" });
      editorRef.current?.commit();
    });

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "edit" }),
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "flush" }),
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "commit" }),
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "postcommit" }),
    );
  });

  it("logs reset event when reaching end of history", () => {
    const log = jest.fn();
    const blocks = [{ id: "a", content: "Hello" }] satisfies TestBlock[];
    const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
      current: null,
    };

    render(<TestEditor ref={editorRef} value={blocks} log={log} />);
    log.mockClear();

    act(() => {
      editorRef.current?.update({ id: "a", content: "World" });
      editorRef.current?.commit();
    });
    log.mockClear();

    act(() => {
      editorRef.current?.history.undo();
      editorRef.current?.commit();
    });

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "reset" }),
    );
  });
});
