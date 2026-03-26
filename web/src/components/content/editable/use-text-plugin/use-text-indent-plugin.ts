import { TextBlock } from ".";
import { SelectionRange } from "../../../../utils/selection-range";
import { SpliceRange } from "../../../../utils/splice-range";
import { ContentEditorPlugin } from "../types";

export const useTextIndentPlugin =
  ({
    tabCharacter = "  ",
  }: {
    tabCharacter?: string;
  } = {}): ContentEditorPlugin<TextBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      if (e.key !== "Tab") return;

      const { id, value } = editor.peek(block.id) ?? block;
      const selection = SelectionRange.read(e.currentTarget);
      const direction = e.shiftKey ? -1 : 1;

      if (!selection) return;

      // Prevent focus change
      e.preventDefault();

      if (SelectionRange.isCollapsed(selection) && direction === 1) {
        editor.push({
          type: "update",
          // Insert tab character at caret
          block: {
            id,
            value: SpliceRange.apply(value, {
              offset: selection.start,
              deleteCount: 0,
              insert: tabCharacter,
            }),
          },
          selectionBefore: selection,
          selectionAfter: {
            start: selection.start + tabCharacter.length,
            end: selection.end + tabCharacter.length,
          },
        });
      } else if (SelectionRange.isCollapsed(selection) && direction == -1) {
        if (!value.startsWith(tabCharacter)) return;

        editor.push({
          type: "update",
          block: {
            id,
            value: value.slice(tabCharacter.length),
          },
          selectionBefore: selection,
          selectionAfter: {
            start: selection.start - tabCharacter.length,
            end: selection.end - tabCharacter.length,
          },
        });
      } else if (direction === 1) {
        // Indent selected lines
        const selectedLines = runGenerator(getLines(value, selection));

        editor.push({
          type: "update",
          block: {
            id,
            value:
              value.slice(0, selectedLines.result.start) +
              selectedLines.values
                .map((line) => tabCharacter + line)
                .join("\n") +
              value.slice(selectedLines.result.end),
          },
          selectionBefore: selection,
          selectionAfter: {
            start: selection.start + tabCharacter.length,
            end:
              selection.end + tabCharacter.length * selectedLines.values.length,
          },
        });
      } else {
        // Unindent selected lines
        const selectedLines = runGenerator(getLines(value, selection));
        const nextValue =
          value.slice(0, selectedLines.result.start) +
          selectedLines.values
            .map((line) =>
              line.startsWith(tabCharacter)
                ? line.slice(tabCharacter.length)
                : line,
            )
            .join("\n");

        if (nextValue === value) return;

        editor.push({
          type: "update",
          block: {
            id,
            value: nextValue,
          },
          selectionBefore: selection,
          selectionAfter: {
            start:
              selection.start -
              (selectedLines.values[0]?.startsWith(tabCharacter)
                ? tabCharacter.length
                : 0),
            end:
              selection.end -
              (selectedLines.values.filter((line) =>
                line.startsWith(tabCharacter),
              ).length -
                1) *
                selectedLines.values.length,
          },
        });
      }

      editor.commit();
    },
  });

useTextIndentPlugin.normalize = function normalizeIndent(
  text: string,
  { tabCharacter }: { tabCharacter: string } = { tabCharacter: "  " },
) {
  return text
    .split("\n")
    .map((line) =>
      line.replace(/^(\s+)/, (spaces) => spaces.replace(/\t/, tabCharacter)),
    )
    .join("\n");
};

function* getLines(text: string, { start, end }: SelectionRange) {
  let selection: SelectionRange | undefined = undefined;

  for (const line of text.split("\n")) {
    const range: SelectionRange = {
      start: selection?.end ?? 0,
      end: (selection?.end ?? 0) + line.length + 1,
    };

    if (range.start > end) break;
    if (range.end < start) continue;

    selection ??= {
      start: range.start,
      end: range.end,
    };
    selection.end = range.end;

    yield line;
  }

  return selection ?? { start, end };
}

function runGenerator<T, TReturn>(
  gen: Generator<T, TReturn>,
): { values: T[]; result: TReturn } {
  const values: T[] = [];
  while (true) {
    const { value, done } = gen.next();
    if (done) {
      return { values, result: value };
    }
    values.push(value);
  }
}
