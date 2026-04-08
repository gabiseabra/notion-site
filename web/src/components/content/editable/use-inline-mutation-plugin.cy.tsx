import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";
import { useContentEditor } from "../editor/use-content-editor";

function TestEditor({
  value,
  onChange,
  inline,
}: {
  value: Notion.Block[];
  onChange: (block: Notion.Block[]) => void;
  inline: boolean;
}) {
  const editor = useContentEditor({
    initialValue: value,
    onCommit: onChange,
  });

  return <Editor editor={editor} options={{ autoCommit: 200, inline }} />;
}

describe("useInlineMutationPlugin", () => {
  it("types some text and saves", () => {
    const onChange = cy.stub().as("onChange");

    cy.mount(
      <TestEditor inline value={[p("a", span("Hello"))]} onChange={onChange} />,
    );

    cy.get("p").click().type("{end} World").should("have.text", "Hello World");

    cy.wait(200);

    cy.get("@onChange").should("have.been.called");

    cy.get("p").should("have.text", "Hello World");
  });

  it("inserts newline into the palceholder span", () => {
    cy.mount(<TestEditor inline value={[p("a")]} onChange={() => {}} />);

    cy.get("p")
      .click()
      .type("{shift}{enter}")
      .type("{shift}{enter}")
      .type("{shift}{enter}");
    cy.get("p span").should("have.text", "\n\n\n");

    cy.wait(200);

    cy.get("p").should("have.text", "\n\n\n");
  });

  it("inserts newline at the end of a rich-text span", () => {
    cy.mount(
      <TestEditor inline value={[p("a", span("Hello"))]} onChange={() => {}} />,
    );

    cy.get("p")
      .click()
      .type("{end}{shift}{enter}more")
      .should("have.text", "Hello\nmore");

    cy.wait(200);

    cy.get("p").should("have.text", "Hello\nmore");
  });

  it("handles type characters then backspace some", () => {
    cy.mount(<TestEditor inline value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("Hello World").should("have.text", "Hello World");

    cy.wait(200);

    cy.get("p")
      .type("{backspace}{backspace}{backspace}{backspace}{backspace}")
      .should("have.text", "Hello ");
  });

  it("selects text then types to replace it", () => {
    cy.mount(
      <TestEditor
        inline
        value={[p("a", span("Hello World"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .click()
      .type("{selectAll}Replaced")
      .should("have.text", "Replaced");
  });

  it("selects text then deletes it", () => {
    cy.mount(
      <TestEditor
        inline
        value={[p("a", span("Hello World"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").click().type("{selectAll}{del}").should("have.text", "");
  });

  it("inserts text via execCommand (simulates paste)", () => {
    cy.mount(
      <TestEditor
        inline
        value={[p("a", span("Before "))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").click().type("{end}");

    cy.document().then((doc) => {
      doc.execCommand("insertText", false, "pasted text");
    });

    cy.get("p").should("have.text", "Before pasted text");
  });

  it("flushes pending changes before block split", () => {
    cy.mount(
      <TestEditor
        inline={false}
        value={[p("a", span("Initial"))]}
        onChange={() => {}}
      />,
    );

    // Type rapidly then immediately press Enter (which triggers block-mutation plugin)
    // The typed text should not disappear (proves flush works before split)
    cy.get("p").click().type("{selectAll}First line{enter}");

    cy.get("p").eq(0).should("have.text", "First line");
    cy.get("p").eq(1).should("exist");
  });

  it("keeps current selection after inline flush", () => {
    cy.mount(
      <TestEditor
        inline
        value={[p("a", span("Line 1"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .click()
      .type("{moveToEnd}{shift}{enter}Line 2")
      .type("{moveToEnd}!{uparrow}{home}");

    cy.wait(200);

    cy.get("p").then(([p]) => {
      expect(SelectionRange.read(p)).to.deep.equal({ start: 0, end: 0 });
    });
  });
});
