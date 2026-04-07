import { Notion } from "@notion-site/common/utils/notion/index.js";
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { SelectionRange } from "../../../utils/selection-range.js";
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

describe("useHistoryPlugin", () => {
  it("undoes and redoes typed edits across blocks", () => {
    cy.mount(
      <TestEditor
        value={[p("a", span("Initial state 123"))]}
        onChange={() => {}}
      />,
    );

    // Delete initial text
    cy.get("p").click().type("{selectAll}{del}");
    cy.wait(200);

    // Write something & wait for commit
    cy.get("p").type("Hello world");
    cy.wait(200);

    // Write something & wait for commit 3 more times
    for (let n = 0; n < 3; n++) {
      cy.get("p").click().type(" .");
      cy.wait(200);
    }

    // Add a newline, write something into it, wait for commit (should be two commits)
    cy.get("p").click().type("\nJust adding a newline");
    cy.wait(200);

    cy.get("p").eq(0).should("contain.text", "Hello world . . .");
    cy.get("p").eq(1).should("contain.text", "Just adding a newline");
    cy.wait(200);

    cy.get("p").eq(1).type("{ctrl}z").type("{ctrl}z").should("not.exist");
    cy.get("p")
      .eq(0)
      .should("have.focus")
      .type("{ctrl}z") // .
      .type("{ctrl}z") // .
      .type("{ctrl}z") // .
      .type("{ctrl}z") // Hello world
      .type("{ctrl}z") // Delete
      .should("contain.text", "Initial state 123");

    cy.get("p")
      .eq(0)
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .should("contain.text", "Hello world . . .")
      .type("{ctrl}y")
      .type("{ctrl}y");

    cy.get("p")
      .eq(1)
      .should("have.focus")
      .should("contain.text", "Just adding a newline");
  });

  it.only("restores cursor position on undo / redo", () => {
    cy.mount(
      <TestEditor value={[p("a", span("Hello World"))]} onChange={() => {}} />,
    );

    // ctrl + backspace triggers deleteWorkBackwards but doesn't actually delete
    // the word backward in electron?
    // cy.get("p").type("{moveToEnd}").type("{ctrl}{backspace}");
    cy.get("p").type("{moveToEnd}").type(Cypress._.repeat("{backspace}", 5));
    cy.wait(200);

    cy.get("p")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 6,
          end: 6,
        });
      })
      .type("{ctrl}z")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 11,
          end: 11,
        });
      })
      .type("{ctrl}y")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 6,
          end: 6,
        });
      });
  });

  it("restores changes across blocks with undo / redo", () => {
    cy.mount(
      <TestEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    const assertBlocks = (expected: string[]) => {
      cy.get("p").should("have.length", expected.length);
      expected.forEach((text, index) => {
        if (text === "") {
          cy.get("p").eq(index).invoke("text").should("match", /^\s*$/);
        } else {
          cy.get("p").eq(index).should("contain.text", text);
        }
      });
    };

    assertBlocks(["First", "Second"]);

    // type in block 1
    cy.get("p").eq(0).click().type("{moveToEnd} One");
    cy.wait(200);
    assertBlocks(["First One", "Second"]);

    // add one block between 1 and 2
    cy.get("p").eq(0).click().type("{moveToEnd}{enter}");
    cy.wait(200);
    assertBlocks(["First One", "", "Second"]);

    // type in new block
    cy.get("p").eq(1).click().type("Middle");
    cy.wait(200);
    assertBlocks(["First One", "Middle", "Second"]);

    // type in last block
    cy.get("p").eq(2).click().type("{moveToEnd} Last");
    cy.wait(200);
    assertBlocks(["First One", "Middle", "Second Last"]);

    // undo step-by-step
    cy.get("p").eq(0).type("{ctrl}z");
    assertBlocks(["First One", "Middle", "Second"]);

    cy.get("p").eq(0).type("{ctrl}z");
    assertBlocks(["First One", "", "Second"]);

    cy.get("p").eq(0).type("{ctrl}z");
    assertBlocks(["First One", "Second"]);

    cy.get("p").eq(0).type("{ctrl}z");
    assertBlocks(["First", "Second"]);

    // redo step-by-step
    cy.get("p").eq(0).type("{ctrl}y");
    assertBlocks(["First One", "Second"]);

    cy.get("p").eq(0).type("{ctrl}y");
    assertBlocks(["First One", "", "Second"]);

    cy.get("p").eq(0).type("{ctrl}y");
    assertBlocks(["First One", "Middle", "Second"]);

    cy.get("p").eq(0).type("{ctrl}y");
    assertBlocks(["First One", "Middle", "Second Last"]);
  });
});
