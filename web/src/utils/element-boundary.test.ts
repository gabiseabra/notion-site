/**
 * @jest-environment jsdom
 */
import { ElementBoundary } from "./element-boundary.js";

describe("ElementBoundary", () => {
  describe("ElementBoundary.read", () => {
    it("returns null inside text", () => {
      const el = document.createElement("div");
      el.textContent = "hello";
      expect(ElementBoundary.read(el, 2)).toBe(null);
    });

    it("returns null inside inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";
      expect(ElementBoundary.read(el, 2)).toBe(null);
    });

    it("returns start at beginning of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";
      const b = el.querySelector("b");
      expect(ElementBoundary.read(el, 6)).toEqual({
        type: "start",
        left: null,
        right: b,
      });
    });

    it("returns end at end of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";
      const b = el.querySelector("b");
      expect(ElementBoundary.read(el, 5)).toEqual({
        type: "end",
        left: b,
        right: null,
      });
    });

    it("returns between when between two inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";
      expect(ElementBoundary.read(el, 5)).toEqual({
        type: "between",
        left: el.querySelector("b"),
        right: el.querySelector("i"),
      });
    });

    it("returns start for an empty span element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<span></span>";
      const span = el.querySelector("span");
      expect(ElementBoundary.read(el, 0)).toEqual({
        type: "start",
        left: null,
        right: span,
      });
    });
  });
});
