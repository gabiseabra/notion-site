import { describe, expect, it } from "@jest/globals";
import { History } from "./history.js";

describe("History", () => {
  const createHistory = () =>
    new History<string[], string>([], (state, cmd) => [...state, cmd]);

  it("returns initial state with no commands", () => {
    const history = createHistory();

    expect(history.getState()).toEqual([]);
    expect(history.position).toBe(0);
    expect(history.command).toBeNull();
  });

  it("applies pushed commands in order", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");

    expect(history.getState()).toEqual(["A", "B"]);
    expect(history.position).toBe(2);
    expect(history.command).toBe("B");
    expect(history.direction).toBe(1);
  });

  it("undo at start returns null and does not change state", () => {
    const history = createHistory();

    expect(history.undo()).toBeNull();
    expect(history.position).toBe(0);
    expect(history.getState()).toEqual([]);
  });

  it("redo at end returns null and does not change state", () => {
    const history = createHistory();

    history.push("A");

    expect(history.redo()).toBeNull();
    expect(history.position).toBe(1);
    expect(history.getState()).toEqual(["A"]);
  });

  it("undo/redo update state correctly", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");
    history.push("C");

    expect(history.undo()).toEqual(["A", "B"]);
    expect(history.redo()).toEqual(["A", "B", "C"]);
  });

  it("command is last undone after undo", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");
    history.push("C");

    history.undo();

    expect(history.direction).toBe(-1);
    expect(history.command).toBe("C");
  });

  it("command is last redone after redo in the middle", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");
    history.push("C");

    history.undo(); // position: 2
    history.undo(); // position: 1

    history.redo(); // position: 2 (not at end)

    expect(history.direction).toBe(1);
    expect(history.command).toBe("B");
  });

  it("truncates redo stack on push after undo", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");
    history.push("C");

    history.undo(); // remove "C"
    history.push("D");

    expect(history.getState()).toEqual(["A", "B", "D"]);
    expect(history.redo()).toBeNull();
  });

  it("snapshot returns state and position", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");

    expect(history.snapshot()).toEqual({
      state: ["A", "B"],
      position: 2,
    });
  });
});
