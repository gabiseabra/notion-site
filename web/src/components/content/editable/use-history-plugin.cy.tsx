import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { ContentEditor } from "../ContentEditor.js";

const options = {
  autoCommit: 200,
};

describe("useHistoryPlugin", () => {
  it("undoes and redoes typed edits across blocks", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("Initial state 123"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    // Delete initial text
    cy.get("p").click().type("{selectAll}{del}");
    cy.wait(options.autoCommit);

    // Write something & wait for commit
    cy.get("p").type("Hello world");
    cy.wait(options.autoCommit);

    // Write something & wait for commit 3 more times
    for (let n = 0; n < 3; n++) {
      cy.get("p").click().type(" .");
      cy.wait(options.autoCommit);
    }

    // Add a newline, write something into it, wait for commit (should be two commits)
    cy.get("p").click().type("\nJust adding a newline");
    cy.wait(options.autoCommit);

    cy.get("p").eq(0).should("contain.text", "Hello world . . .");
    cy.get("p").eq(1).should("contain.text", "Just adding a newline");
    cy.wait(options.autoCommit);

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

  it("restores cursor position on undo / redo", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("Hello World"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    cy.get("p").type("{moveToEnd}").type("{ctrl}{backspace}");
    cy.wait(options.autoCommit);

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
});
