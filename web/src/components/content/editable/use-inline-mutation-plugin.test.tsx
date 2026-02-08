/**
 * @jest-environment jsdom
 */
import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { render } from "@testing-library/react";
import { act, RefObject } from "react";
import { setupUserEvent } from "../../../test-utils/user-event.js";
import { ContentEditor, TContentEditor } from "../ContentEditor.js";

describe("useInlineMutationPlugin", () => {
  it("handles typing sequence", async () => {
    const user = setupUserEvent();

    const editorRef: RefObject<TContentEditor<Notion.Block> | null> = {
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

    await user.click(el);
    await user.input(el, "{ArrowRight}{ArrowRight}{ArrowRight}");
    await user.input(el, "{Backspace}");
    await user.input(el, "llo");

    act(() => {
      editorRef.current?.commit();
    });

    const rich_text = zNotion.blocks.paragraph.parse(
      editorRef.current?.blocks[0],
    ).paragraph.rich_text;
    expect(Notion.RTF.getContent(rich_text)).toBe("hello");
  });
});
