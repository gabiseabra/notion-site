/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import {
  act,
  Ref,
  RefObject,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { EditorEvent } from "./editor-event.js";
import { ContentEditor } from "./types.js";
import { useContentEditor } from "./use-content-editor.js";

type TestBlock = { id: string; text: string };

type TestEditorProps = {
  ref?: Ref<ContentEditor<TestBlock> | null>;
  value: TestBlock[];
  onReady?: (event: EditorEvent<TestBlock, "ready">) => void;
};

function TestEditor({ ref, value: initialValue, onReady }: TestEditorProps) {
  const { editor } = useContentEditor({
    initialValue,
    plugin: () => () => ({}),
  });

  useImperativeHandle(ref, () => editor, [editor]);

  useLayoutEffect(() => {
    if (!onReady) return;
    const handler = (event) => onReady(event);
    editor.bus.addEventListener("ready", handler);
    return () => editor.bus.removeEventListener("ready", handler);
  }, [editor, onReady]);

  return null;
}

describe("useContentEditor", () => {
  describe("lifecycle", () => {
    it("fires ready on init", () => {
      const onReady = jest.fn();

      render(
        <TestEditor
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
          onReady={onReady}
        />,
      );

      expect(onReady).toHaveBeenCalledTimes(1);
      expect(onReady).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "ready" }),
      );
    });

    it("fires postcommit after commit", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();
      const onPostcommit = jest.fn();
      editorRef.current?.bus.addEventListener("postcommit", onPostcommit);

      act(() => {
        editorRef.current?.update({ id: "a", text: "Updated" });
        editorRef.current?.commit();
      });

      expect(onPostcommit).toHaveBeenCalledTimes(1);
      expect(onPostcommit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "postcommit" }),
      );
    });
  });

  describe("commands (non-batch)", () => {
    it.each([
      {
        name: "update",
        run: (editor: ContentEditor<TestBlock>, blocks: TestBlock[]) =>
          editor.update({ ...blocks[0], text: "Updated" }),
        expected: (blocks: TestBlock[]) => [
          { ...blocks[0], text: "Updated" },
          blocks[1],
        ],
      },
      {
        name: "remove",
        run: (editor: ContentEditor<TestBlock>, blocks: TestBlock[]) =>
          editor.remove(blocks[0]),
        expected: (blocks: TestBlock[]) => [blocks[1]],
      },
      {
        name: "split",
        run: (editor: ContentEditor<TestBlock>, blocks: TestBlock[]) =>
          editor.split(
            { ...blocks[0], text: "Left" },
            { id: "c", text: "Right" },
          ),
        expected: (blocks: TestBlock[]) => [
          { ...blocks[0], text: "Left" },
          { id: "c", text: "Right" },
          blocks[1],
        ],
      },
    ])("applies $name only after commit", ({ run, expected }) => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };
      const initialBlocks = [
        { id: "a", text: "Hello" },
        { id: "b", text: "World" },
      ] satisfies TestBlock[];

      render(<TestEditor ref={editorRef} value={initialBlocks} />);

      expect(editorRef.current).toBeTruthy();

      act(() => {
        run(editorRef.current!, initialBlocks);
      });

      expect(editorRef.current?.blocks).toEqual(initialBlocks);

      act(() => {
        editorRef.current?.commit();
      });

      expect(editorRef.current?.blocks).toEqual(expected(initialBlocks));
    });
  });

  describe("batching", () => {
    it("toggles inBatch true to false across flush", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();

      act(() => {
        editorRef.current?.update(
          { id: "a", text: "Updated" },
          { batchId: "a" },
        );
      });

      expect(editorRef.current?.inBatch()).toBe(true);

      act(() => {
        editorRef.current?.flush();
      });

      expect(editorRef.current?.inBatch()).toBe(false);
    });

    it("accumulates commands for the same batchId", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();
      const onFlush = jest.fn();
      editorRef.current?.bus.addEventListener("flush", onFlush);

      act(() => {
        editorRef.current?.update(
          { id: "a", text: "One" },
          { batchId: "batch" },
        );
        editorRef.current?.update(
          { id: "a", text: "Two" },
          { batchId: "batch" },
        );
        editorRef.current?.flush("test");
      });

      expect(onFlush).toHaveBeenCalledTimes(1);

      expect(onFlush.mock.calls[0]?.[0]?.detail.batchId).toBe("batch");
      expect(onFlush.mock.calls[0]?.[0]?.detail.commands).toHaveLength(2);
    });

    it("flushes the previous batch when a new batch starts", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();

      act(() => {
        editorRef.current?.update({ id: "a", text: "One" }, { batchId: "a" });
      });

      expect(editorRef.current?.history.position).toBe(0);

      act(() => {
        editorRef.current?.update({ id: "a", text: "Two" }, { batchId: "b" });
      });

      expect(editorRef.current?.history.position).toBe(1);
      expect(editorRef.current?.inBatch()).toBe(true);
    });

    it("ends the batch even if flush calls preventDefault", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();
      const onFlush = jest.fn((event) => event.preventDefault());
      editorRef.current?.bus.addEventListener("flush", onFlush);

      act(() => {
        editorRef.current?.update(
          { id: "a", text: "Updated" },
          { batchId: "a" },
        );
      });

      act(() => {
        editorRef.current?.flush();
      });

      expect(onFlush).toHaveBeenCalledTimes(1);
      expect(editorRef.current?.inBatch()).toBe(false);
      expect(editorRef.current?.history.position).toBe(0);
    });

    it("prevents batch creation when edit is cancelled", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();
      const onEdit = jest.fn((event) => event.preventDefault());
      editorRef.current?.bus.addEventListener("edit", onEdit);

      act(() => {
        editorRef.current?.update(
          { id: "a", text: "Updated" },
          { batchId: "a" },
        );
      });

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(editorRef.current?.inBatch()).toBe(false);
      expect(editorRef.current?.history.position).toBe(0);
    });
  });

  describe("read semantics", () => {
    it("returns pending state from peek during a batch", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();

      act(() => {
        editorRef.current?.update(
          { id: "a", text: "Updated" },
          { batchId: "a" },
        );
      });

      expect(editorRef.current?.blocks[0]?.text).toBe("Hello");
      expect(editorRef.current?.peek("a")?.text).toBe("Updated");
    });

    it("returns committed state from peek when no batch exists", () => {
      const editorRef: RefObject<ContentEditor<TestBlock> | null> = {
        current: null,
      };

      render(
        <TestEditor
          ref={editorRef}
          value={[
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ]}
        />,
      );

      expect(editorRef.current).toBeTruthy();

      expect(editorRef.current?.peek("a")?.text).toBe(
        editorRef.current?.blocks[0]?.text,
      );
    });
  });
});
