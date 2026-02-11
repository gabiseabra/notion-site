/**
 * @jest-environment jsdom
 */

import { CaretOffset } from "./caret-offset.js";

describe("CaretOffset", () => {
  describe("CaretOffset.read", () => {
    it("returns outside inside plain text", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(CaretOffset.read(el, 2)).toEqual({
        type: "outside",
        node: el.firstChild,
        offset: 2,
      });
    });

    it("returns boundary start at beginning of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";

      expect(CaretOffset.read(el, 6)).toEqual({
        type: "boundary",
        boundary: {
          type: "start",
          left: el.firstChild,
          right: el.querySelector("b"),
        },
      });
    });

    it("returns boundary end at end of inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";

      expect(CaretOffset.read(el, 5)).toEqual({
        type: "boundary",
        boundary: {
          type: "end",
          left: el.querySelector("b"),
          right: el.lastChild,
        },
      });
    });

    it("returns boundary between when between two inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretOffset.read(el, 5)).toEqual({
        type: "boundary",
        boundary: {
          type: "between",
          left: el.querySelector("b"),
          right: el.querySelector("i"),
        },
      });
    });

    it("returns inside for an empty span element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<span></span>";

      expect(CaretOffset.read(el, 0)).toEqual({
        type: "inside",
        node: el.querySelector("span"),
        offset: 0,
      });
    });

    it("returns inside when offset is inside inline element text", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(CaretOffset.read(el, 2)).toEqual({
        type: "inside",
        node: el.querySelector("b"),
        offset: 2,
      });
    });

    it("returns inside in mixed content when offset is inside inline text", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretOffset.read(el, 2)).toEqual({
        type: "inside",
        node: el.querySelector("b"),
        offset: 1,
      });
    });

    it("returns boundary start at boundary before inline in mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretOffset.read(el, 1)).toEqual({
        type: "boundary",
        boundary: {
          type: "start",
          left: el.firstChild,
          right: el.querySelector("b"),
        },
      });
    });

    it("returns boundary end at boundary after inline in mixed content", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>bc</b>d";

      expect(CaretOffset.read(el, 3)).toEqual({
        type: "boundary",
        boundary: {
          type: "end",
          left: el.querySelector("b"),
          right: el.lastChild,
        },
      });
    });

    it("returns boundary between in empty div with multiple elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b><i></i>";

      expect(CaretOffset.read(el, 0)).toEqual({
        type: "boundary",
        boundary: {
          type: "between",
          left: el.querySelector("b"),
          right: el.querySelector("i"),
        },
      });
    });
  });

  describe("CaretOffset.toDOMPosition", () => {
    it("returns inside as-is", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(
        CaretOffset.toDOMPosition({
          type: "inside",
          node: el.querySelector("b")!,
          offset: 2,
        }),
      ).toEqual({
        node: el.querySelector("b"),
        offset: 2,
      });
    });

    it("returns outside as-is", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(
        CaretOffset.toDOMPosition({
          type: "outside",
          node: el.firstChild as Text,
          offset: 3,
        }),
      ).toEqual({
        node: el.firstChild,
        offset: 3,
      });
    });

    it("resolves boundary start to right element at offset 0", () => {
      const el = document.createElement("div");
      el.innerHTML = "x<b>yy</b>";

      expect(
        CaretOffset.toDOMPosition({
          type: "boundary",
          boundary: {
            type: "start",
            left: el.firstChild as Text,
            right: el.querySelector("b")!,
          },
        }),
      ).toEqual({
        node: el.querySelector("b"),
        offset: 0,
      });
    });

    it("resolves boundary end to left element at element text end", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>x";

      expect(
        CaretOffset.toDOMPosition({
          type: "boundary",
          boundary: {
            type: "end",
            left: el.querySelector("b")!,
            right: el.lastChild as Text,
          },
        }),
      ).toEqual({
        node: el.querySelector("b"),
        offset: 5,
      });
    });

    it("resolves boundary between to left end when prefer = -1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>ab</b><i>cd</i>";

      expect(
        CaretOffset.toDOMPosition(
          {
            type: "boundary",
            boundary: {
              type: "between",
              left: el.querySelector("b")!,
              right: el.querySelector("i")!,
            },
          },
          -1,
        ),
      ).toEqual({
        node: el.querySelector("b"),
        offset: 2,
      });
    });

    it("resolves boundary between to right start when prefer = 1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>ab</b><i>cd</i>";

      expect(
        CaretOffset.toDOMPosition(
          {
            type: "boundary",
            boundary: {
              type: "between",
              left: el.querySelector("b")!,
              right: el.querySelector("i")!,
            },
          },
          1,
        ),
      ).toEqual({
        node: el.querySelector("i"),
        offset: 0,
      });
    });

    it("resolves empty left element end as offset 0", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b>x";

      expect(
        CaretOffset.toDOMPosition({
          type: "boundary",
          boundary: {
            type: "end",
            left: el.querySelector("b")!,
            right: el.lastChild as Text,
          },
        }),
      ).toEqual({
        node: el.querySelector("b"),
        offset: 0,
      });
    });
  });

  describe("CaretOffset.read + CaretOffset.toDOMPosition", () => {
    it("round-trips plain text offset", () => {
      const el = document.createElement("div");
      el.textContent = "hello";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 2)!)).toEqual({
        node: el.firstChild,
        offset: 2,
      });
    });

    it("round-trips inside inline text", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 2)!)).toEqual({
        node: el.querySelector("b"),
        offset: 2,
      });
    });

    it("round-trips boundary start to inline start", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 6)!)).toEqual({
        node: el.querySelector("b"),
        offset: 0,
      });
    });

    it("round-trips boundary end to inline end", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 5)!)).toEqual({
        node: el.querySelector("b"),
        offset: 5,
      });
    });

    it("round-trips boundary between to left end  when prefer = -1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 5)!, -1)).toEqual({
        node: el.querySelector("b"),
        offset: 5,
      });
    });

    it("round-trips boundary between to right start when prefer = 1", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 5)!, 1)).toEqual({
        node: el.querySelector("i"),
        offset: 0,
      });
    });

    it("round-trips empty inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "<span></span>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 0)!)).toEqual({
        node: el.querySelector("span"),
        offset: 0,
      });
    });

    it("round-trips empty container with two inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b></b><i></i>";

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 0)!, -1)).toEqual({
        node: el.querySelector("b"),
        offset: 0,
      });

      expect(CaretOffset.toDOMPosition(CaretOffset.read(el, 0)!, 1)).toEqual({
        node: el.querySelector("i"),
        offset: 0,
      });
    });
  });
});
