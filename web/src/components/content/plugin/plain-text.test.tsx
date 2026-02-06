/**
 * @jest-environment jsdom
 */
import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { p, span } from "@notion-site/common/test-utils/mock-block.js";
import { getRichTextContent } from "@notion-site/common/utils/notion/rich-text.js";
import { render } from "@testing-library/react";
import { act, RefObject } from "react";
import { setupUserEvent } from "../../../test-utils/user-event.js";
import { ContentEditor, TContentEditor } from "../ContentEditor.js";

describe("plainTextPlugin", () => {
  it("handles typing sequence", async () => {
    const user = setupUserEvent();

    const blocks = [p("420", span("hey"))];
    const editorRef: RefObject<TContentEditor | null> = { current: null };

    const { container } = render(
      <ContentEditor ref={editorRef} value={blocks} onChange={() => {}} />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();
    expect(el.textContent).toBe("hey");

    await user.click(el);
    await user.input(el, "{ArrowRight}{ArrowRight}{ArrowRight}");
    await user.input(el, "{Backspace}");
    await user.input(el, "llo");

    act(() => {
      editorRef.current?.flush();
      editorRef.current?.commit();
    });

    const rich_text = zNotion.blocks.paragraph.parse(
      editorRef.current?.blocks[0],
    ).paragraph.rich_text;
    expect(getRichTextContent(rich_text)).toBe("hello");
  });
});
