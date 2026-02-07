/**
 * @jest-environment jsdom
 */
import { p, span } from "@notion-site/common/test-utils/mock-block.js";
import { fireEvent, render } from "@testing-library/react";
import {
  getMaxSelectionOffset,
  getSelectionRange,
  setSelectionRange,
} from "../../../utils/selection.js";
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

    setSelectionRange(first, {
      start: getMaxSelectionOffset(first),
      end: null,
    });

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(getSelectionRange(second)).toEqual({ start: 0, end: null });
    expect(getSelectionRange(first)).toBeNull();
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];
    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    setSelectionRange(second, { start: 0, end: null });

    fireEvent.keyDown(second, { key: "ArrowLeft" });

    const range = getSelectionRange(first);
    expect(range).toEqual({
      start: getMaxSelectionOffset(first),
      end: null,
    });
    expect(getSelectionRange(second)).toBeNull();
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

    setSelectionRange(first, { start: 2, end: null });

    fireEvent.keyDown(first, { key: "ArrowDown" });

    expect(getSelectionRange(first)).toBeNull();
    expect(getSelectionRange(second)).toBeTruthy();
  });

  it.skip("moves caret to previous block on ArrowUp", () => {
    const blocks = [p("a", span("First")), p("b", span("Second"))];
    const { container } = render(
      <ContentEditor value={blocks} onChange={() => {}} />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    setSelectionRange(second, { start: 2, end: null });

    fireEvent.keyDown(second, { key: "ArrowUp" });

    expect(getSelectionRange(first)).toBeTruthy();
    expect(getSelectionRange(second)).toBeNull();
  });
});
