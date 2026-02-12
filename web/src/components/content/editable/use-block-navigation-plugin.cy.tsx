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

  it("moves caret to next block on ArrowDown when caret is in the last line", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("Multi\nLine\nString")), p("b", span("Second"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@first").click().type("{downArrow}{downArrow}");

    cy.get("@first").should("have.focus");

    cy.get("@first").click().type("{downArrow}");

    cy.get("@second").should("have.focus");
  });

  it("moves caret to previous block on ArrowUp when caret is in the first line", () => {
    cy.mount(
      <ContentEditor
        value={[p("a", span("First")), p("b", span("Multi\nLine\nString"))]}
        onChange={() => {}}
      />,
    );

    cy.get("p").eq(0).as("first");
    cy.get("p").eq(1).as("second");

    cy.get("@second").click().type("{upArrow}{upArrow}");

    cy.get("@second").should("have.focus");

    cy.get("@second").click().type("{upArrow}");

    cy.get("@first").should("have.focus");
  });
});
