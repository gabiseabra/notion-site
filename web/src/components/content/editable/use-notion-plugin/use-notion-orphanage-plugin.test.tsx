/**
 * @jest-environment jsdom
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { Ref, RefObject, useImperativeHandle } from "react";
import { inputEvent } from "../../../../test-utils/input-event.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { Editor } from "../../Editor.js";
import { useContentEditor } from "../../editor/use-content-editor";

const child = (id: string, parentId: string, ...text: Notion.RichText) => ({
  ...p(id, ...text),
  parent: { type: "block_id" as const, block_id: parentId },
});

function TestEditor({
  ref,
  value,
  onChange,
}: {
  ref?: Ref<Editor>;
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
}) {
  const editor = useContentEditor({
    initialValue: value,
    onCommit: onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return <Editor editor={editor} />;
}

describe("useNotionOrphanagePlugin", () => {
  it("re-parents children of deleted block to deleted block's parent on merge", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <TestEditor
        ref={editorRef}
        value={[
          p("a", span("A")),
          p("b", span("B")),
          child("c", "b", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    // b is merged into a (deleted); c was child of b → now child of b's parent (page)
    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
  });

  it("re-parents children of original block to the new block on split", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <TestEditor
        ref={editorRef}
        value={[p("a", span("HelloWorld")), child("b", "a", span("B"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insertParagraph(el, 1);

    // a was split into "Hello" (keeps id "a") and a new "World" block
    const blocks = editorRef.current!.blocks;
    const newBlock = blocks.find((bl) => bl.id !== "a" && bl.id !== "b")!;
    expect(newBlock).toBeTruthy();

    // b was child of a → now child of the new right block
    expect(blocks.find((bl) => bl.id === "b")?.parent).toEqual({
      type: "block_id",
      block_id: newBlock.id,
    });
  });
});
