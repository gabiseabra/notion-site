/**
 * @jest-environment jsdom
 */
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { inputEvent } from "../../../test-utils/input-event.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";

describe("useHistoryPlugin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("undoes on Cmd+Z", async () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insert(el, " World");
    // @note inline-mutation-plugin does not auto-commit
    // need to wait a little for auto-commit-plugin to fire
    act(() => jest.advanceTimersByTime(1000));

    expect(el.textContent).toBe("Hello World");

    fireEvent.keyDown(el, { key: "z", metaKey: true });

    expect(el.textContent).toBe("Hello");
  });

  it("redoes on Cmd+Shift+Z", async () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insert(el, " World");
    act(() => jest.advanceTimersByTime(1000));

    expect(el.textContent).toBe("Hello World");

    fireEvent.keyDown(el, { key: "z", metaKey: true });
    expect(el.textContent).toBe("Hello");

    fireEvent.keyDown(el, { key: "z", metaKey: true, shiftKey: true });
    expect(el.textContent).toBe("Hello World");
  });

  it("redoes on Cmd+Y", async () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insert(el, " World");
    act(() => jest.advanceTimersByTime(1000));

    expect(el.textContent).toBe("Hello World");

    fireEvent.keyDown(el, { key: "z", metaKey: true });
    expect(el.textContent).toBe("Hello");

    fireEvent.keyDown(el, { key: "y", metaKey: true });
    expect(el.textContent).toBe("Hello World");
  });

  it("does nothing when no command in history", () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    fireEvent.keyDown(el, { key: "z", metaKey: true });

    expect(el.textContent).toBe("Hello");
  });

  it("restores selection before undo", async () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 2, end: 2 });
    inputEvent.insert(el, "X");
    act(() => jest.advanceTimersByTime(1000));

    expect(el).toMatchVisualSelection("HeX|llo");

    fireEvent.keyDown(el, { key: "z", metaKey: true });

    expect(el).toMatchVisualSelection("He|llo");
  });

  it("restores selection after redo", async () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 2, end: 2 });
    inputEvent.insert(el, "X");
    act(() => jest.advanceTimersByTime(1000));

    expect(el).toMatchVisualSelection("HeX|llo");

    fireEvent.keyDown(el, { key: "z", metaKey: true });

    expect(el).toMatchVisualSelection("He|llo");

    fireEvent.keyDown(el, { key: "z", metaKey: true, shiftKey: true });
    expect(el).toMatchVisualSelection("HeX|llo");
  });
});
