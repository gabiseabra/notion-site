import { MaybeReadonly } from "@notion-site/common/types/readonly.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorCommand } from "../editor/editor-command";
import { AnyBlock } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

type Mod = "Ctrl" | "Alt" | "Shift" | "Meta";
type Key =
  | "Enter"
  | "Tab"
  | "Escape"
  | "Backspace"
  | "Delete"
  | "Space"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type Hotkey = `${Mod}+${Key}` | `${Mod}+${Mod}+${Key}` | Key;

export type HotkeyPluginOptions<TBlock extends AnyBlock> = MaybeReadonly<{
  key: Hotkey | Hotkey[];
  command: EditorCommand<TBlock>;
}>;

export const useHotkeyPlugin =
  <TBlock extends AnyBlock>(
    hotkey: HotkeyPluginOptions<TBlock>,
  ): ContentEditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      const key = toHotkey(e.nativeEvent);
      const selection = SelectionRange.read(e.currentTarget);

      if (
        !selection ||
        !(typeof hotkey.key === "string"
          ? hotkey.key === key
          : hotkey.key.includes(key))
      )
        return;

      const currentBlock = editor.peek(block.id) ?? block;
      const nextBlock = hotkey.command(currentBlock, selection, editor);

      if (nextBlock) {
        const data = new useHotkeyPlugin.EventData(block, key);

        editor.update(nextBlock, {
          data,
          selectionBefore: selection,
          selectionAfter: selection,
        });
        editor.commit(data);

        e.preventDefault();
        e.stopPropagation();
      }
    },
  });

function toHotkey(e: KeyboardEvent): Hotkey {
  const mods: Mod[] = [];
  if (e.ctrlKey) mods.push("Ctrl");
  if (e.altKey) mods.push("Alt");
  if (e.shiftKey) mods.push("Shift");
  if (e.metaKey) mods.push("Meta");

  const key =
    e.key === " " ? "Space" : e.key.length === 1 ? e.key.toLowerCase() : e.key;
  return (mods.length ? `${mods.join("+")}+${key}` : key) as Hotkey;
}

useHotkeyPlugin.EventData = class HotkeyEventData<TBlock extends AnyBlock> {
  constructor(
    public block: TBlock,
    public hotkey: Hotkey,
  ) {}
};
