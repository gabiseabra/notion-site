import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";

describe("useBlockMutationPlugin", () => {
  it("merges with previous block on backspace at start of block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(1).click().type("{moveToStart}{backspace}");

    cy.get("p").should("have.length", 1);
    cy.get("p").should("have.text", "FirstSecond");
  });

  it("does nothing on backspace at start of first block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).click().type("{moveToStart}{backspace}");

    cy.get("p").should("have.length", 2);
    cy.get("p").eq(0).should("have.text", "First");
    cy.get("p").eq(1).should("have.text", "Second");
  });

  it("deletes empty block on backspace", () => {
    cy.mount(
      <Editor value={[p("a", span("First")), p("b")]} onChange={() => {}} />,
    );

    cy.get("p").eq(1).click().type("{backspace}").should("not.exist");

    cy.get("p").should("have.length", 1);
    cy.get("p").should("have.text", "First");
  });

  it("splits block at caret position on Enter in middle of text", () => {
    cy.mount(
      <Editor value={[p("a", span("HelloWorld"))]} onChange={() => {}} />,
    );

    cy.get("p").click().type("{moveToStart}");
    for (let i = 0; i < 5; i++) {
      cy.get("p").eq(0).type("{rightArrow}");
    }
    cy.get("p").eq(0).type("{enter}");

    cy.get("p").should("have.length", 2);
    cy.get("p").eq(0).should("have.text", "Hello");
    cy.get("p").eq(1).should("have.text", "World");
  });

  it("creates empty block above on Enter at start of block", () => {
    cy.mount(<Editor value={[p("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("p").click().type("{moveToStart}{enter}");

    cy.get("p").should("have.length", 2);
    cy.get("p").eq(0).should("have.text", "");
    cy.get("p").eq(1).should("have.text", "Hello");
  });

  it("creates empty block below on Enter at end of block", () => {
    cy.mount(<Editor value={[p("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("p").click().type("{end}{enter}");

    cy.get("p").should("have.length", 2);
    cy.get("p").eq(0).should("have.text", "Hello");
    cy.get("p").eq(1).should("have.text", "");
  });

  it("does not split on Shift+Enter", () => {
    cy.mount(<Editor value={[p("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("p").click().type("{end}{shift}{enter}");

    cy.get("p").should("have.length", 1);
  });

  it("focuses the new block after Enter split", () => {
    cy.mount(<Editor value={[p("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("p").click().type("{end}{enter}");

    cy.get("p").eq(1).should("have.focus");
  });

  it("focuses the previous block after merge", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .eq(1)
      .click()
      .type("{moveToStart}{backspace}")
      .should("not.exist");

    cy.get("p").eq(0).should("have.focus");
  });

  it("places caret at merge boundary after merge", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .eq(1)
      .click()
      .type("{moveToStart}{backspace}")
      .should("not.exist");

    // Caret should be at position 5 (after "First")
    cy.get("p")
      .eq(0)
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({ start: 5, end: 5 });
      });
  });
});
