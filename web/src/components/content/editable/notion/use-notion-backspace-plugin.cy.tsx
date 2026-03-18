import { ol, span, todo, ul } from "@notion-site/common/utils/notion/wip.js";
import { Editor } from "../../Editor.js";

describe("useNotionBackspacePlugin", () => {
  it("converts bulleted list item to paragraph on Backspace at start", () => {
    cy.mount(<Editor value={[ul("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("li p").click().type("{moveToStart}{backspace}");

    cy.get("li").should("not.exist");
    cy.get("p").should("have.text", "Hello");
  });

  it("converts numbered list item to paragraph on Backspace at start", () => {
    cy.mount(<Editor value={[ol("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("li p").click().type("{moveToStart}{backspace}");

    cy.get("li").should("not.exist");
    cy.get("p").should("have.text", "Hello");
  });

  it("converts to-do to paragraph on Backspace at start", () => {
    cy.mount(<Editor value={[todo("a", span("Hello"))]} onChange={() => {}} />);

    cy.get("label p").click().type("{moveToStart}{backspace}");

    cy.get("input[type=checkbox]").should("not.exist");
    cy.get("p").should("have.text", "Hello");
  });

  it("splits numbered list into two lists when middle item is converted to paragraph", () => {
    cy.mount(
      <Editor
        value={[
          ol("a", span("First")),
          ol("b", span("Second")),
          ol("c", span("Third")),
        ]}
        onChange={() => {}}
      />,
    );

    cy.get("li").eq(1).find("p").click().type("{moveToStart}{backspace}");

    cy.get("ol").should("have.length", 2);
  });
});
