import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { ContentEditor } from "../ContentEditor.js";

describe("useBlockNavigationPlugin", () => {
  it("moves caret to next block on ArrowRight at end", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).type("{end}").type("{rightArrow}");

    cy.get("p").eq(1).should("have.focus");
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(1).type(Cypress._.repeat("{leftArrow}", 7));

    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from empty block", () => {
    cy.mount(
      <ContentEditor value={[p("a"), p("b"), p("c")]} onChange={() => {}} />,
    );

    cy.get("p").eq(0).click().type("{downArrow}");
    cy.get("p").eq(1).should("have.focus").type("{downArrow}");
    cy.get("p").eq(2).should("have.focus");
  });

  it("moves caret to previous block on ArrowUp from empty block", () => {
    cy.mount(
      <ContentEditor value={[p("a"), p("b"), p("c")]} onChange={() => {}} />,
    );

    cy.get("p").eq(2).click().type("{upArrow}");
    cy.get("p").eq(1).should("have.focus").type("{upArrow}");
    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from simple block", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).click().type("{downArrow}");
    cy.get("p").eq(1).should("have.focus");
  });

  it("moves caret to previous block on ArrowUp from simple block", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(1).click().type("{upArrow}");
    cy.get("p").eq(0).should("have.focus");
  });

  it("moves caret to next block on ArrowDown from multi-line block", () => {
    cy.mount(
      <ContentEditor
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
      <ContentEditor
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
});
