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

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@first").type("{end}").type("{rightArrow}");

    cy.get("@second").should("have.focus");
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@second").type(Cypress._.repeat("{leftArrow}", 7));

    cy.get("@first").should("have.focus");
  });

  it("moves caret to previous block on ArrowDown", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@first").click().type("{downArrow}");

    cy.get("@second").should("have.focus");
  });

  it("moves caret to previous block on ArrowUp", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@second").click().type("{upArrow}");

    cy.get("@first").should("have.focus");
  });
});
