/**
 * @jest-environment jsdom
 */
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { act } from "react";
import { inputEvent } from "../../../test-utils/input-event.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";

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
      <Editor
        value={[p("a", span("Hello"))]}
        onChange={onChange}
        options={{ autoCommit: 200 }}
      />,
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
