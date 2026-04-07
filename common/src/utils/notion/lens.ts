import { Lens } from "../lens.js";
import { Block } from "./block.js";
import * as RTF from "./rich-text.js";

export const code: Lens<Block, string> = {
  get(block) {
    if (block.type !== "code") return "";
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

export const caption: Lens<Block, RTF.RichText> = {
  get(block) {
    if (block.type !== "code") return [];
    return block.code.caption;
  },
  set(block, caption) {
    if (block.type !== "code") return block;
    return {
      ...block,
      code: {
        ...block.code,
        caption,
      },
    };
  },
};
