import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { Editor } from "../Editor.js";

describe("useAutoCommitPlugin", () => {
  it("preserves focus when auto-commit fires while another block is active", () => {
    cy.mount(
      <Editor
        value={[p("a", span("Hello")), p("b", span("World"))]}
        onChange={() => {}}
        options={{ autoCommit: 200 }}
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
