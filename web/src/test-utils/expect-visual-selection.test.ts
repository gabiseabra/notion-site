import {
  parseSelectionRange,
  renderSelectionRange,
} from "./expect-visual-selection.js";

describe("expect-visual-selection", () => {
  it("round-trips visual selection", () => {
    for (const input of ["he[ll]o", "hell|o", "|hello", "[hello]", "hello|"]) {
      const parsed = parseSelectionRange(input);
      const rendered = renderSelectionRange(parsed.text, parsed.selection);
      expect(rendered).toBe(input);
    }
  });

  it("parses bracket selection with exclusive end", () => {
    expect(parseSelectionRange("he[ll]o")).toEqual({
      text: "hello",
      selection: { start: 2, end: 4 },
    });
  });

  it("renders exclusive-end selection with brackets", () => {
    expect(renderSelectionRange("hello", { start: 2, end: 4 })).toBe("he[ll]o");
  });
});
