import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { EditorHistory, type EditorCommandCmd } from "./editor-history.js";

type Block = { id: string; text: string };

const block = (id: string, text: string): Block => ({ id, text });

describe("EditorHistory", () => {
  it("applies compound apply commands in order", () => {
    const history = new EditorHistory<Block>([
      block("a", "alpha"),
      block("b", "bravo"),
    ]);

    const commands = NonEmpty.create<EditorCommandCmd<Block>>(
      { type: "update", block: block("a", "alpha!") },
      {
        type: "split",
        left: block("a", "al"),
        right: block("c", "pha!"),
      },
      { type: "remove", block: block("b", "bravo") },
    );

    history.push({ type: "apply", commands });

    expect(history.getState()).toEqual([block("a", "al"), block("c", "pha!")]);
  });
});
