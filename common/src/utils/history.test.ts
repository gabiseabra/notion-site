import { describe, expect, it } from "@jest/globals";
import { History } from "./history.js";

describe("History", () => {
  const createHistory = () =>
    new History<string, string[]>([], (state, cmd) => [...state, cmd]);

  it("returns initial state with no commands", () => {
    const history = createHistory();

    expect(history.getState()).toEqual([]);
    expect(history.position).toBe(0);
    expect(history.action).toBeNull();
  });

  it("snapshot returns state and position", () => {
    const history = createHistory();

    history.push("A");
    history.push("B");

    expect(history.snapshot()).toEqual({ state: ["A", "B"], position: 2 });
  });

  describe("push", () => {
    it("applies pushed commands in order", () => {
      const history = createHistory();

      history.push("A");
      history.push("B");

      expect(history.getState()).toEqual(["A", "B"]);
      expect(history.position).toBe(2);
      expect(history.action).toBe("B");
      expect(history.direction).toBe(1);
    });
  });

  describe("undo", () => {
    it("returns false when not undoable", () => {
      expect(createHistory().undo()).toBe(false);
    });

    it("returns true with dryRun when undoable but does not run side effects", () => {
      const history = createHistory();
      history.push("A");

      expect(history.undo(true)).toBe(true);
      expect(history.position).toBe(1);
    });

    it("reverts to the previous state and fires undo event", () => {
      const history = createHistory();
      history.push("A");
      history.push("B");

      history.undo();

      expect(history.getState()).toEqual(["A"]);
    });
  });

  describe("redo", () => {
    it("returns false when not redoable", () => {
      const history = createHistory();
      history.push("A");

      expect(history.redo()).toBe(false);
    });

    it("returns true with dryRun when redoable but does not run side effects", () => {
      const history = createHistory();
      history.push("A");
      history.undo();

      expect(history.redo(true)).toBe(true);
      expect(history.position).toBe(0);
    });

    it("applies the next action and fires redo event", () => {
      const history = createHistory();
      history.push("A");
      history.push("B");
      history.undo();

      history.redo();

      expect(history.getState()).toEqual(["A", "B"]);
    });
  });
});
