import { zNotion } from "../../dto/notion/schema/index.js";
import { hasPropertyValue } from "../guards.js";
import * as _Block from "./blocks.js";
import * as _RTF from "./rich-text.js";
import * as _WIP from "./wip.js";

export namespace Notion {
  // direct type
  export type Block = _Block.Block;
  export type RichText = _RTF.RichText;
  export type RichTextItem = _RTF.Item;
  export type Annotations = _RTF.Annotations;

  // module-style access
  export import Block = _Block;
  export import RTF = _RTF;
  export import WIP = _WIP;

  export function titleToString({ title }: zNotion.properties.title) {
    return (
      title
        .filter(hasPropertyValue("type", "text"))
        .map((text) => text.text.content)
        .join(" ") || undefined
    );
  }
}
