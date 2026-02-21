/**
 * @jest-environment jsdom
 */
import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { act, RefObject } from "react";
import { inputEvent } from "../../../test-utils/input-event.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { ContentEditor } from "../ContentEditor.js";

describe("useInlineMutationPlugin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("handles typing from the middle", async () => {
    const editorRef: RefObject<ContentEditor.Editor | null> = {
      current: null,
    };

    const { container } = render(
      <ContentEditor
        ref={editorRef}
        value={[p("420", span("hey"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();
    expect(el.textContent).toBe("hey");

    SelectionRange.apply(el, { start: 3, end: 3 });
    inputEvent.delete(el, 1);
    inputEvent.insert(el, "llo");
    act(() => jest.advanceTimersByTime(1000));

    const rich_text = zNotion.blocks.paragraph.parse(
      editorRef.current?.blocks[0],
    ).paragraph.rich_text;
    expect(Notion.RTF.getContent(rich_text)).toBe("hello");
    expect(el).toMatchVisualSelection("hello|");
  });

  it("handles typing in empty element", async () => {
    const editorRef: RefObject<ContentEditor.Editor | null> = {
      current: null,
    };

    const { container } = render(
      <ContentEditor ref={editorRef} value={[p("a")]} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.insert(el, "XY");
    act(() => jest.advanceTimersByTime(1000));

    const rich_text = zNotion.blocks.paragraph.parse(
      editorRef.current?.blocks[0],
    ).paragraph.rich_text;
    expect(Notion.RTF.getContent(rich_text)).toBe("XY");
    expect(el).toMatchVisualSelection("XY|");
  });

  it("adds newline on Shift+Enter", async () => {
    const editorRef: RefObject<ContentEditor.Editor | null> = {
      current: null,
    };

    const { container } = render(
      <ContentEditor
        ref={editorRef}
        value={[p("a", span("Hello"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insertLine(el, 1);
    inputEvent.insert(el, "World");
    act(() => jest.advanceTimersByTime(1000));

    const rich_text = zNotion.blocks.paragraph.parse(
      editorRef.current?.blocks[0],
    ).paragraph.rich_text;
    expect(Notion.RTF.getContent(rich_text)).toBe("Hello\nWorld");
    expect(el).toMatchVisualSelection("Hello\nWorld|");
  });
});
