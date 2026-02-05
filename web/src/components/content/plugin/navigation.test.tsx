/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import { p, span } from "@notion-site/common/test-utils/mock-block.js";
import { fireEvent, render } from "@testing-library/react";
import {
  getMaxSelectionOffset,
  getSelectionRange,
  setSelectionRange,
} from "../../../utils/selection.js";
import { ContentEditor } from "../ContentEditor.js";

describe("navigationPlugin", () => {
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
});
