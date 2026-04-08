import { Prism } from "../optics/prism.js";
import { Block } from "./block.js";
import * as RTF from "./rich-text.js";

export const code: Prism<Block, string> = {
  get(block) {
    if (block.type !== "code") return undefined;
    return RTF.getContent(block.code.rich_text);
  },
  set(block, code) {
    if (block.type !== "code") return block;
    return {
      ...block,
      code: {
        ...block.code,
        rich_text: [RTF.text(code)],
      },
    };
  },
};
