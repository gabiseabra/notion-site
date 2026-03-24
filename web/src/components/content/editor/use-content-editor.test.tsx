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
import { ContentEditor } from "./types.js";
import { useContentEditor } from "./use-content-editor.js";

type TestBlock = { id: string; text: string };

type TestEditorProps = {
  ref?: Ref<ContentEditor<TestBlock> | null>;
  value: TestBlock[];
};

function TestEditor({ ref, value: initialValue }: TestEditorProps) {
  const { editor } = useContentEditor({
    initialValue,
    plugin: () => () => ({}),
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return null;
}

describe("useContentEditor", () => {
  describe("lifecycle", () => {
    it("fires ready on init", () => {
      const onReady = jest.fn();

      const ReadyProbe = () => {
        const { editor } = useContentEditor({
          initialValue: [
            { id: "a", text: "Hello" },
            { id: "b", text: "World" },
          ],
          plugin: () => () => ({}),
        });

        useLayoutEffect(() => {
          editor.bus.addEventListener("ready", onReady);
          return () => editor.bus.removeEventListener("ready", onReady);
        }, [editor]);

        return null;
      };

      render(<ReadyProbe />);

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
        editorRef.current?.push({
          type: "update",
          block: { id: "a", text: "Updated" },
        });
        editorRef.current?.commit();
      });

      expect(onPostcommit).toHaveBeenCalledTimes(1);
      expect(onPostcommit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "postcommit" }),
      );
    });
  });

  describe("peek semantics", () => {
    it("returns pending history state from peek before commit", () => {
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
        editorRef.current?.push({
          type: "update",
          block: { id: "a", text: "Updated" },
        });
      });

      expect(editorRef.current?.blocks[0]?.text).toBe("Hello");
      expect(editorRef.current?.peek("a")?.text).toBe("Updated");
    });

    it("returns committed state from peek when history is unchanged", () => {
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
