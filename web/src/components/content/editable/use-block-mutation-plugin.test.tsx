/**
 * @jest-environment jsdom
 */
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { inputEvent } from "../../../test-utils/input-event.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";

describe("useBlockMutationPlugin", () => {
  it("merges with previous block on Backspace at start", () => {
    const { container } = render(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    SelectionRange.apply(second, { start: 0, end: 0 });
    inputEvent.delete(second);

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]?.textContent).toBe("FirstSecond");
  });

  it("does nothing on Backspace at start of first block", () => {
    const { container } = render(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    SelectionRange.apply(first, { start: 0, end: 0 });
    inputEvent.delete(first);

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent).toBe("First");
    expect(paragraphs[1]?.textContent).toBe("Second");
  });

  it("splits block on Enter at caret position", () => {
    const { container } = render(
      <Editor value={[p("a", span("HelloWorld"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insertParagraph(el, 1);

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent).toBe("Hello");
    expect(paragraphs[1]?.textContent).toBe("World");
  });

  it("does not split on Shift+Enter", () => {
    const { container } = render(
      <Editor value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insertLine(el, 1);

    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
