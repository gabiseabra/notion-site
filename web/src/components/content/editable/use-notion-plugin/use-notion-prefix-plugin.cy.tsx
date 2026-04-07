import { p } from "@notion-site/common/utils/notion/wip.js";
import { Editor } from "../../Editor.js";

describe("useNotionPrefixPlugin", () => {
  it("converts paragraph to heading_1 on typing '# '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("# test");

    cy.get("h2").should("have.text", "test");
  });

  it("converts paragraph to heading_2 on typing '## '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("## test");

    cy.get("h3").should("have.text", "test");
  });

  it("converts paragraph to heading_3 on typing '### '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("### test");

    cy.get("h4").should("have.text", "test");
  });

  it("converts paragraph to bulleted list on typing '- '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("- test");

    cy.get("li").should("have.text", "test");
  });

  it("converts paragraph to numbered list on typing '1. '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("1. test");

    cy.get("li").should("have.text", "test");
  });

  it("converts paragraph to numbered list on typing 'n. '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("123. test");

    cy.get("ol").should("match", "[start=123]");
    cy.get("li").should("have.text", "test");
  });

  it("converts paragraph to unchecked to-do on typing '[ ] '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("[ ] test");

    cy.get("input[type=checkbox]").should("not.be.checked");
    cy.get("label").should("have.text", "test");
  });

  it("converts paragraph to checked to-do on typing '[x] '", () => {
    cy.mount(<Editor value={[p("a")]} onChange={() => {}} />);

    cy.get("p").click().type("[x] test");

    cy.get("input[type=checkbox]").should("be.checked");
    cy.get("label").should("have.text", "test");
  });

  it("converts paragraph to numbered list on typing the next number below a numbered list", () => {
    cy.mount(<Editor value={[p("1"), p("2")]} onChange={() => {}} />);

    cy.get("p")
      .eq(0)
      .click()
      .realType("1. a{enter}b")
      .realPress("ArrowDown")
      .realType("3. c");

    cy.get("li").should("have.length", 3);
    cy.get("li").eq(0).should("have.text", "a");
    cy.get("li").eq(1).should("have.text", "b");
    cy.get("li").eq(2).should("have.text", "c");
  });
});
