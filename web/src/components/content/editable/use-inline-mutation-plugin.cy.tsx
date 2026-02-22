import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { Editor } from "../Editor.js";

const options = {
  autoCommit: 200,
  multiline: true,
};

describe("useInlineMutationPlugin", () => {
  it("inserts newline into the palceholder span", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} options={options} />);

    cy.get("p")
      .click()
      .type("{shift}{enter}")
      .type("{shift}{enter}")
      .type("{shift}{enter}");
    cy.get("p span").should("have.text", "\n\n\n");
  });

  it("inserts newline at the end of a rich-text span", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Hello"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    cy.get("p")
      .click()
      .type("{end}{shift}{enter}more")
      .should("have.text", "Hello\nmore");
  });

  it("prevents Shift+Enter newline when multiline is disabled", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Hello"))]}
        onChange={() => {}}
        options={{ ...options, multiline: false }}
      />,
    );

    cy.get("p")
      .click()
      .type("{end}{shift}{enter}")
      .should("have.text", "Hello");
  });

  it("handles type characters then backspace some", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} options={options} />);

    cy.get("p").click().type("Hello World").should("have.text", "Hello World");

    cy.wait(options.autoCommit);

    cy.get("p")
      .type("{backspace}{backspace}{backspace}{backspace}{backspace}")
      .should("have.text", "Hello ");
  });

  it("selects text then types to replace it", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Hello World"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    cy.get("p")
      .click()
      .type("{selectAll}Replaced")
      .should("have.text", "Replaced");
  });

  it("selects text then deletes it", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Hello World"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    cy.get("p").click().type("{selectAll}{del}").should("have.text", "");
  });

  it("inserts text via execCommand (simulates paste)", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Before "))]}
        onChange={() => {}}
        options={options}
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
      <Editor
        value={[p("a", span("Initial"))]}
        onChange={() => {}}
        options={options}
      />,
    );

    // Type rapidly then immediately press Enter (which triggers block-mutation plugin)
    // The typed text should not disappear (proves flush works before split)
    cy.get("p").click().type("{selectAll}First line{enter}");

    cy.get("p").eq(0).should("have.text", "First line");
    cy.get("p").eq(1).should("exist");
  });
});
