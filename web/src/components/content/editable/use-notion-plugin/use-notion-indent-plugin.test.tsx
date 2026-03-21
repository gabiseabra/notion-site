/**
 * @jest-environment jsdom
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { fireEvent, render } from "@testing-library/react";
import { RefObject } from "react";
import { inputEvent } from "../../../../test-utils/input-event.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { Editor } from "../../Editor.js";

const child = (id: string, parentId: string, ...text: Notion.RichText) => ({
  ...p(id, ...text),
  parent: { type: "block_id" as const, block_id: parentId },
});

describe("useNotionIndentPlugin", () => {
  it("indents block under previous sibling on Tab", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[p("a", span("A")), p("b", span("B"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
  });

  it("makes direct children siblings of the indented block on Tab (not children of it)", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
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
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
  });

  it("does not re-parent grandchildren on Tab", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          p("b", span("B")),
          child("c", "b", span("C")),
          child("d", "c", span("D")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "d")?.parent).toEqual(
      { type: "block_id", block_id: "c" },
    );
  });

  it("does nothing on Tab when block has no previous sibling", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[p("a", span("A"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "a")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
  });

  it("indents an already-nested block under its previous sibling on Tab", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("x", span("X")),
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "a", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[3]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "b" },
    );
  });

  it("re-parents all direct children to the new parent on Tab", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("x", span("X")),
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "a", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(editorRef.current?.blocks.find((b) => b.id === "a")?.parent).toEqual(
      { type: "block_id", block_id: "x" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "block_id", block_id: "x" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "x" },
    );
  });

  it("unindents block to page level on Backspace at start", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[p("a", span("A")), child("b", "a", span("B"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
  });

  it("unindents deeply nested block to grandparent on Backspace at start", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "b", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[2]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
  });

  it("keeps children with the block when unindenting (children are not left behind)", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "b", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "b" },
    );
  });

  it("keeps children with a deeply nested block when unindenting", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "b", span("C")),
          child("d", "c", span("D")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[2]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "d")?.parent).toEqual(
      { type: "block_id", block_id: "c" },
    );
  });

  it("preserves block order when unindenting a nested block with children", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "b", span("C")),
          child("d", "c", span("D")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[2]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el, 2);

    expect(editorRef.current?.blocks.map((b) => b.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("re-parents following siblings to the unindented block on Backspace at start", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "a", span("C")),
          child("d", "c", span("D")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "block_id", block_id: "b" },
    );
    expect(editorRef.current?.blocks.map((b) => b.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("unindents block without affecting its siblings on Backspace at start", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[
          p("x", span("X")),
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "a", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[3]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "c")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
    expect(editorRef.current?.blocks.find((b) => b.id === "b")?.parent).toEqual(
      { type: "block_id", block_id: "a" },
    );
  });

  it("does nothing on Backspace at start when block is at page level", () => {
    const editorRef: RefObject<Editor | null> = { current: null };
    const { container } = render(
      <Editor
        ref={editorRef}
        value={[p("a", span("A"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(editorRef.current?.blocks.find((b) => b.id === "a")?.parent).toEqual(
      { type: "page_id", page_id: "" },
    );
  });

  it("restores cursor to position 0 on the block after unindenting", () => {
    const { container } = render(
      <Editor
        value={[
          p("a", span("A")),
          child("b", "a", span("B")),
          child("c", "b", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.delete(el);

    expect(container.querySelectorAll("p")[1]).toMatchVisualSelection("|B");
  });

  it("restores cursor to its original position after indenting", () => {
    const { container } = render(
      <Editor
        value={[
          p("a", span("A")),
          p("b", span("BB")),
          child("c", "b", span("C")),
        ]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelectorAll("p")[1]!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 1, end: 1 });
    fireEvent.keyDown(el, { key: "Tab" });

    expect(container.querySelectorAll("p")[1]).toMatchVisualSelection("B|B");
  });
});
