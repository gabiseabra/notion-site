describe("expect-visual-selection", () => {
  it("matches collapsed selection at various positions", () => {
    expect({
      text: "hello",
      selection: { start: 0, end: 0 },
    }).toMatchVisualSelection("|hello");
    expect({
      text: "hello",
      selection: { start: 4, end: 4 },
    }).toMatchVisualSelection("hell|o");
    expect({
      text: "hello",
      selection: { start: 5, end: 5 },
    }).toMatchVisualSelection("hello|");
  });

  it("matches non-collapsed selection with brackets", () => {
    expect({
      text: "hello",
      selection: { start: 2, end: 4 },
    }).toMatchVisualSelection("he[ll]o");
    expect({
      text: "hello",
      selection: { start: 0, end: 5 },
    }).toMatchVisualSelection("[hello]");
  });
});
