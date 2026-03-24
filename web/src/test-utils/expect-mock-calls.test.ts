describe("toBeCalledDuring", () => {
  it("passes when calls match expected in order", () => {
    const mock = jest.fn();

    expect(mock).toBeCalledDuring(() => {
      mock("a");
      mock("b");
      mock("c");
    }, ["a", "b", "c"]);
  });

  it("excludes calls made before fn", () => {
    const mock = jest.fn();
    mock("before");

    expect(mock).toBeCalledDuring(() => {
      mock("during");
    }, ["during"]);
  });

  it("fails when order differs", () => {
    const mock = jest.fn();

    expect(() =>
      expect(mock).toBeCalledDuring(() => {
        mock("b");
        mock("a");
      }, ["a", "b"]),
    ).toThrow();
  });

  it("fails when there are more calls than expected", () => {
    const mock = jest.fn();

    expect(() =>
      expect(mock).toBeCalledDuring(() => {
        mock("a");
        mock("b");
        mock("c");
      }, ["a", "b"]),
    ).toThrow();
  });
});
