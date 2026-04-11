import { runGenerator } from "@notion-site/common/utils/generator.js";
import { TextBlock } from ".";
import { getLines } from "../../../../utils/code";
import { SelectionRange } from "../../../../utils/selection-range";
import { SpliceRange } from "../../../../utils/splice-range";
import { ContentEditor } from "../../editor/types";
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
      if (e.key === "Tab") {
        // Prevent focus change
        e.preventDefault();
        handleShift(block, editor, tabCharacter, e.shiftKey ? -1 : 1);
      }
    },
    onInput(e) {
      if (e.nativeEvent.inputType === "insertLineBreak") {
        handleNewLine(block, editor, tabCharacter);
      }
    },
  });

function handleShift(
  block: TextBlock,
  editor: ContentEditor<TextBlock>,
  tabCharacter: string,
  direction: 1 | -1,
) {
  const { id, value } = editor.peek(block.id) ?? block;
  const element = editor.ref(id).element;
  const selection = element && SelectionRange.read(element);

  if (!selection) return;

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
      targetBefore: {
        id,
        ...selection,
      },
      targetAfter: {
        id,
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
      targetBefore: {
        id,
        ...selection,
      },
      targetAfter: {
        id,
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
          selectedLines.values.map((line) => tabCharacter + line).join("\n") +
          value.slice(selectedLines.result.end),
      },
      targetBefore: {
        id,
        ...selection,
      },
      targetAfter: {
        id,
        start: selection.start + tabCharacter.length,
        end: selection.end + tabCharacter.length * selectedLines.values.length,
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
      targetBefore: {
        id,
        ...selection,
      },
      targetAfter: {
        id,
        start:
          selection.start -
          (selectedLines.values[0]?.startsWith(tabCharacter)
            ? tabCharacter.length
            : 0),
        end:
          selection.end -
          (selectedLines.values.filter((line) => line.startsWith(tabCharacter))
            .length -
            1) *
            selectedLines.values.length,
      },
    });
  }

  editor.commit();
}

function handleNewLine(
  block: TextBlock,
  editor: ContentEditor<TextBlock>,
  tabCharacter: string,
) {
  const { id, value } = editor.peek(block.id) ?? block;
  const element = editor.ref(id).element;
  const selection = element && SelectionRange.read(element);

  if (!selection || !SelectionRange.isCollapsed(selection)) return;

  const selectedLines = selection && runGenerator(getLines(value, selection));
  const line = selectedLines.values[0] ?? "";
  const tabSize = (() => {
    let i = 0;

    while (line.slice(i, tabCharacter.length) === tabCharacter) i++;

    return i + (line.slice(0, selection.end).trim().endsWith("{") ? 1 : 0);
  })();

  editor.push({
    type: "update",
    block: {
      id,
      value: SpliceRange.apply(value, {
        offset: selection.start,
        deleteCount: 0,
        insert: tabCharacter.repeat(tabSize),
      }),
    },
    targetBefore: {
      id,
      ...selection,
    },
    targetAfter: {
      id,
      start: selection.start + tabCharacter.length * tabSize,
      end: selection.end + tabCharacter.length * tabSize,
    },
  });

  editor.commit();
}
