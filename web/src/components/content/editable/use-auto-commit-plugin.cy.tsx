import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
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
  it("preserves focus when auto-commit fires while another block is active", () => {
    cy.mount(
      <TestEditor
        value={[p("a", span("Hello")), p("b", span("World"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).click().type("asdfg{downArrow}");
    cy.wait(202);

    cy.get("p").eq(1).should("have.focus");

    cy.get("p").eq(1).type("qwerty{upArrow}");
    cy.wait(202);

    cy.get("p").eq(0).should("have.focus");
  });
});
