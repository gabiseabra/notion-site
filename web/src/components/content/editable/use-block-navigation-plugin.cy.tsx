import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Editor } from "../Editor.js";

describe("useBlockNavigationPlugin", () => {
  it("moves caret to next block on ArrowRight at end", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).type("{end}").type("{rightArrow}");

    cy.get("p").eq(1).should("have.focus");
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(1).type(Cypress._.repeat("{leftArrow}", 7));

    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from empty block", () => {
    cy.mount(<Editor value={[p("a"), p("b"), p("c")]} onChange={() => {}} />);

    cy.get("p").eq(0).click().type("{downArrow}");
    cy.get("p").eq(1).should("have.focus").type("{downArrow}");
    cy.get("p").eq(2).should("have.focus");
  });

  it("moves caret to previous block on ArrowUp from empty block", () => {
    cy.mount(<Editor value={[p("a"), p("b"), p("c")]} onChange={() => {}} />);

    cy.get("p").eq(2).click().type("{upArrow}");
    cy.get("p").eq(1).should("have.focus").type("{upArrow}");
    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from simple block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).click().type("{downArrow}");
    cy.get("p").eq(1).should("have.focus");
  });

  it("moves caret to previous block on ArrowUp from simple block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(1).click().type("{upArrow}");
    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from multi-line block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Multi\nLine\nString")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .eq(0)
      .click()
      .type("{moveToStart}{downArrow}{downArrow}")
      .should("have.focus")
      .type("{downArrow}");

    cy.get("p").eq(1).should("have.focus");
  });

  it("moves caret to previous block on ArrowUp from multi-line block", () => {
    cy.mount(
      <Editor
        value={[p("a", span("First")), p("b", span("Multi\nLine\nString"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p")
      .eq(1)
      .click()
      .type("{moveToEnd}{upArrow}{upArrow}")
      .should("have.focus")
      .type("{upArrow}");

    cy.get("p").eq(0).should("have.focus");
  });

  it("preserves caret column when moving down and up between blocks", () => {
    cy.mount(
      <div style={{ fontFamily: "monospace" }}>
        <Editor
          value={[
            p("a", span("aaaaaa")),
            p("b", span("aaaaaa")),
            p("c", span("aaaaaa")),
          ]}
          onChange={() => {}}
        />
      </div>,
    );

    const expectRange = (index: number, start: number) => {
      cy.get("p")
        .eq(index)
        .should("have.focus")
        .then(([node]) => {
          expect(SelectionRange.read(node)).to.deep.equal({
            start,
            end: start,
          });
        });
    };

    cy.get("p")
      .eq(0)
      .click()
      .type("{moveToStart}{rightArrow}{rightArrow}{rightArrow}");
    expectRange(0, 3);

    cy.get("p").eq(0).type("{downArrow}");
    expectRange(1, 3);

    cy.get("p").eq(1).type("{downArrow}");
    expectRange(2, 3);

    cy.get("p").eq(2).type("{upArrow}");
    expectRange(1, 3);

    cy.get("p").eq(1).type("{upArrow}");
    expectRange(0, 3);

    cy.get("p").eq(0).type("{leftArrow}{leftArrow}{leftArrow}");
    expectRange(0, 0);
  });

  it("moves through empty block when navigating down and up", () => {
    cy.mount(
      <Editor
        value={[p("a", span("A")), p("b"), p("c", span("C"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).click().type(Cypress._.repeat("{downArrow}", 2));
    cy.get("p").eq(2).should("have.focus");

    cy.get("p").eq(2).type(Cypress._.repeat("{upArrow}", 2));
    cy.get("p").eq(0).should("have.focus");
  });
});
