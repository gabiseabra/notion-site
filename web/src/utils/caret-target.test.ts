/**
 * @jest-environment jsdom
 */

import { Anchor, CaretTarget } from "./caret-target.js";

const elementAnchor = (element: HTMLElement | null): Anchor => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("impossible");
  }
  return { type: "element", element };
};

const textAnchor = (node: ChildNode | null): Anchor => {
  if (!(node instanceof Text) || !node.parentElement) {
    throw new Error("impossible");
  }
  return { type: "text", node };
};

describe("CaretTarget", () => {
  describe("CaretTarget.getAnchor", () => {
    it("returns null when offset is out of bounds", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(CaretTarget.getAnchor(el, 6)).toBe(null);
    });

    it("returns null when offset is out of bounds in mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretTarget.getAnchor(el, 5)).toBe(null);
    });

    it("returns outside inside plain text", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(CaretTarget.getAnchor(el, 2)).toEqual({
        type: "outside",
        node: el.firstChild,
        offset: 2,
      });
    });

    it("returns boundary start at beginning of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";

      expect(CaretTarget.getAnchor(el, 6)).toEqual({
        type: "boundary",
        boundary: {
          type: "start",
          left: el.firstChild,
          right: textAnchor(el.querySelector("b")!.firstChild),
        },
      });
    });

    it("returns boundary end at end of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";

      expect(CaretTarget.getAnchor(el, 5)).toEqual({
        type: "boundary",
        boundary: {
          type: "end",
          left: textAnchor(el.querySelector("b")!.firstChild),
          right: el.lastChild,
        },
      });
    });

    it("returns boundary between when between two inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretTarget.getAnchor(el, 5)).toEqual({
        type: "boundary",
        boundary: {
          type: "between",
          left: textAnchor(el.querySelector("b")!.firstChild),
          right: textAnchor(el.querySelector("i")!.firstChild),
        },
      });
    });

    it("returns inside for an empty span element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<span></span>";

      expect(CaretTarget.getAnchor(el, 0)).toEqual({
        type: "inside",
        node: elementAnchor(el.querySelector("span")),
        offset: 0,
      });
    });

    it("returns inside when offset is inside inline element text", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(CaretTarget.getAnchor(el, 2)).toEqual({
        type: "inside",
        node: textAnchor(el.querySelector("b")!.firstChild),
        offset: 2,
      });
    });

    it("returns inside in mixed content when offset is inside inline text", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretTarget.getAnchor(el, 2)).toEqual({
        type: "inside",
        node: textAnchor(el.querySelector("b")!.firstChild),
        offset: 1,
      });
    });

    it("returns boundary start at boundary before inline in mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretTarget.getAnchor(el, 1)).toEqual({
        type: "boundary",
        boundary: {
          type: "start",
          left: el.firstChild,
          right: textAnchor(el.querySelector("b")!.firstChild),
        },
      });
    });

    it("returns boundary end at boundary after inline in mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretTarget.getAnchor(el, 3)).toEqual({
        type: "boundary",
        boundary: {
          type: "end",
          left: textAnchor(el.querySelector("b")!.firstChild),
          right: el.lastChild,
        },
      });
    });

    it("returns boundary between in empty div with multiple elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b><i></i>";

      expect(CaretTarget.getAnchor(el, 0)).toEqual({
        type: "boundary",
        boundary: {
          type: "between",
          left: elementAnchor(el.querySelector("b")),
          right: elementAnchor(el.querySelector("i")),
        },
      });
    });

    it("returns boundary start in empty element with mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <i></i>";

      expect(CaretTarget.getAnchor(el, 6)).toEqual({
        type: "boundary",
        boundary: {
          type: "start",
          left: el.firstChild,
          right: elementAnchor(el.querySelector("i")),
        },
      });
    });

    it("returns boundary end in empty element with mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "<i></i> hello";

      expect(CaretTarget.getAnchor(el, 0)).toEqual({
        type: "boundary",
        boundary: {
          type: "end",
          left: elementAnchor(el.querySelector("i")),
          right: el.lastChild,
        },
      });
    });
  });

  describe("CaretTarget.fromAnchor", () => {
    it("returns inside as-is", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(
        CaretTarget.fromAnchor({
          type: "inside",
          node: textAnchor(el.querySelector("b")!.firstChild),
          offset: 2,
        }),
      ).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 2,
      });
    });

    it("returns outside as-is", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(
        CaretTarget.fromAnchor({
          type: "outside",
          node: el.firstChild as Text,
          offset: 3,
        }),
      ).toEqual({
        type: "root",
        node: el.firstChild,
        offset: 3,
      });
    });

    it("resolves boundary start to right element at offset 0", () => {
      const el = document.createElement("div");
      el.innerHTML = "x<b>yy</b>";

      expect(
        CaretTarget.fromAnchor({
          type: "boundary",
          boundary: {
            type: "start",
            left: el.firstChild as Text,
            right: textAnchor(el.querySelector("b")!.firstChild!),
          },
        }),
      ).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 0,
      });
    });

    it("resolves boundary end to left element at element text end", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>x";

      expect(
        CaretTarget.fromAnchor({
          type: "boundary",
          boundary: {
            type: "end",
            left: textAnchor(el.querySelector("b")!.firstChild),
            right: el.lastChild as Text,
          },
        }),
      ).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 5,
      });
    });

    it("resolves boundary between to left end when prefer = -1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>ab</b><i>cd</i>";

      expect(
        CaretTarget.fromAnchor(
          {
            type: "boundary",
            boundary: {
              type: "between",
              left: textAnchor(el.querySelector("b")!.firstChild),
              right: textAnchor(el.querySelector("i")!.firstChild),
            },
          },
          -1,
        ),
      ).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 2,
      });
    });

    it("resolves boundary between to right start when prefer = 1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>ab</b><i>cd</i>";

      expect(
        CaretTarget.fromAnchor(
          {
            type: "boundary",
            boundary: {
              type: "between",
              left: textAnchor(el.querySelector("b")!.firstChild),
              right: textAnchor(el.querySelector("i")!.firstChild),
            },
          },
          1,
        ),
      ).toEqual({
        type: "text",
        node: el.querySelector("i")!.firstChild,
        offset: 0,
      });
    });

    it("resolves empty left element end as offset 0", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b>x";

      expect(
        CaretTarget.fromAnchor({
          type: "boundary",
          boundary: {
            type: "end",
            left: elementAnchor(el.querySelector("b")),
            right: el.lastChild as Text,
          },
        }),
      ).toEqual({
        type: "element",
        element: el.querySelector("b"),
        offset: 0,
      });
    });
  });

  describe.only("CaretTarget.resolve", () => {
    it("resolves plain text offset", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(CaretTarget.resolve(el, 2)).toEqual({
        type: "root",
        node: el.firstChild,
        offset: 2,
      });
    });

    it("resolves inside inline text", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(CaretTarget.resolve(el, 2)).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 2,
      });
    });

    it("resolves boundary start to inline start", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";

      expect(CaretTarget.resolve(el, 6)).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 0,
      });
    });

    it("resolves boundary end to inline end", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";

      expect(CaretTarget.resolve(el, 5)).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 5,
      });
    });

    it("resolves boundary between to left end  when prefer = -1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretTarget.resolve(el, 5, -1)).toEqual({
        type: "text",
        node: el.querySelector("b")!.firstChild,
        offset: 5,
      });
    });

    it("resolves boundary between to right start when prefer = 1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretTarget.resolve(el, 5, 1)).toEqual({
        type: "text",
        node: el.querySelector("i")!.firstChild,
        offset: 0,
      });
    });

    it("resolves empty inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<span></span>";

      expect(CaretTarget.resolve(el, 0)).toEqual({
        type: "element",
        element: el.querySelector("span"),
        offset: 0,
      });
    });

    it("resolves empty container with two inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b><i></i>";

      expect(CaretTarget.resolve(el, 0, -1)).toEqual({
        type: "element",
        element: el.querySelector("b"),
        offset: 0,
      });

      expect(CaretTarget.resolve(el, 0, 1)).toEqual({
        type: "element",
        element: el.querySelector("i"),
        offset: 0,
      });
    });
  });
});
