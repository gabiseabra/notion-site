import { describe, expect, it } from "@jest/globals";
import { create, map } from "./block-tree.js";
import { ol, p } from "./wip.js";

describe("Notion.BlockTree", () => {
  describe("Notion.BlockTree.map", () => {
    it("traverses flat tree depth-first", () => {
      expect(
        map<string[]>(
          create([p("1"), p("2"), p("3")]),
          (acc, block) => [block.id, ...acc.flat()],
          (children) => children.flat(),
        ).flat(),
      ).toEqual(["1", "2", "3"]);
    });

    it("traverses nested tree depth-first", () => {
      expect(
        map<string[]>(
          create([
            p("1"),
            { ...p("1.1"), parent: { type: "block_id", block_id: "1" } },
            { ...p("1.2"), parent: { type: "block_id", block_id: "1" } },
            { ...p("1.2.1"), parent: { type: "block_id", block_id: "1.2" } },
            p("2"),
            p("3"),
          ]),
          (acc, block) => [block.id, ...acc.flat()],
          (children) => children.flat(),
        ).flat(),
      ).toEqual(["1", "1.1", "1.2", "1.2.1", "2", "3"]);
    });

    it("traverses nested tree with lists depth-first", () => {
      expect(
        map<string[]>(
          create([
            ol("1"),
            ol("2"),
            { ...ol("2.1"), parent: { type: "block_id", block_id: "2" } },
            { ...ol("2.2"), parent: { type: "block_id", block_id: "2" } },
            { ...ol("2.2.1"), parent: { type: "block_id", block_id: "2.2" } },
            { ...ol("2.2.2"), parent: { type: "block_id", block_id: "2.2" } },
            { ...ol("2.2.3"), parent: { type: "block_id", block_id: "2.2" } },
            p("a"),
          ]),
          (acc, block) => [block.id, ...acc.flat()],
          (children) => children.flat(),
        ).flat(),
      ).toEqual(["1", "2", "2.1", "2.2", "2.2.1", "2.2.2", "2.2.3", "a"]);
    });
  });
});
