/**
 * @jest-environment jsdom
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { act } from "react";
import { inputEvent } from "../../../test-utils/input-event.js";
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

  return <Editor editor={editor} options={{ autoCommit: 200 }} />;
}

describe("useAutoCommitPlugin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("commits after debounce when input occurs", () => {
    const onChange = jest.fn();

    const { container } = render(
      <TestEditor value={[p("a", span("Hello"))]} onChange={onChange} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insert(el, " World");

    expect(onChange).toHaveBeenCalledTimes(0);

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(onChange).toHaveBeenCalledTimes(0);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
