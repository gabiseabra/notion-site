/**
 * @jest-environment jsdom
 */
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { fireEvent, render } from "@testing-library/react";
import { Selection } from "../../../utils/selection.js";
import { ContentEditor } from "../ContentEditor.js";

describe("useBlockNavigationPlugin", () => {
  it("moves caret to next block on ArrowRight at end", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];

    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    Selection.apply(first, {
      start: Selection.maxOffset(first),
      end: null,
    });

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(Selection.read(second)).toEqual({
      start: 0,
      end: null,
    });
    expect(Selection.read(first)).toBeNull();
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];
    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    Selection.apply(second, { start: 0, end: null });

    fireEvent.keyDown(second, { key: "ArrowLeft" });

    const range = Selection.read(first);
    expect(range).toEqual({
      start: Selection.maxOffset(first),
      end: null,
    });
    expect(Selection.read(second)).toBeNull();
  });

  // @todo fix: TypeError: range.getClientRects is not a function
  // JSDOM does not implement getClientRects, need to mock.
  it.skip("moves caret to previous block on ArrowDown", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];
    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    Selection.apply(first, { start: 2, end: null });

    fireEvent.keyDown(first, { key: "ArrowDown" });

    expect(Selection.read(first)).toBeNull();
    expect(Selection.read(second)).toBeTruthy();
  });

  it.skip("moves caret to previous block on ArrowUp", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];
    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    Selection.apply(second, { start: 2, end: null });

    fireEvent.keyDown(second, { key: "ArrowUp" });

    expect(Selection.read(first)).toBeTruthy();
    expect(Selection.read(second)).toBeNull();
  });
});
