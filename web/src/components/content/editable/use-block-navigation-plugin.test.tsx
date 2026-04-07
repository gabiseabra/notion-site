/**
 * @jest-environment jsdom
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { fireEvent, render } from "@testing-library/react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";
import { useContentEditor } from "../editor/use-content-editor";

function TestEditor({
  value,
  onChange,
}: {
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
}) {
  const editor = useContentEditor({
    initialValue: value,
    onCommit: onChange,
  });

  return <Editor editor={editor} />;
}

describe("useBlockNavigationPlugin", () => {
  it("moves caret to next block on ArrowRight at end", () => {
    const { container } = render(
      <TestEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    SelectionRange.apply(first, {
      start: SelectionRange.maxOffset(first),
      end: SelectionRange.maxOffset(first),
    });

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(SelectionRange.read(second)).toEqual({
      start: 0,
      end: 0,
    });
    expect(SelectionRange.read(first)).toBeNull();
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    const { container } = render(
      <TestEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));

    SelectionRange.apply(second, { start: 0, end: 0 });

    fireEvent.keyDown(second, { key: "ArrowLeft" });

    const range = SelectionRange.read(first);
    expect(range).toEqual({
      start: SelectionRange.maxOffset(first),
      end: SelectionRange.maxOffset(first),
    });
    expect(SelectionRange.read(second)).toBeNull();
  });
});
