import { History } from "@notion-site/common/utils/history.js";
import { Lens } from "@notion-site/common/utils/lens.js";
import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useEffect, useMemo, useRef } from "react";
import { ContentEditorPlugin } from "../editable/types";
import { ExecCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event";
import { applyActions, EditorAction } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types";

export function useEditorLens<
  TBlock extends AnyBlock,
  TParent extends AnyBlock,
  TDetail,
>({
  id: parentId,
  editor: parent,
  plugin,
  lens,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  plugin: ContentEditorPlugin<TBlock, TDetail>;
  lens: Lens<TParent, TBlock[]>;
}) {
  const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const editorRef = useRef<ContentEditor<TBlock>>(null);

  /** Translates a child action into a parent action via the lens. */
  const liftAction = (
    childAction: EditorAction<TBlock>,
    parentBlock: TParent,
  ): EditorAction<TParent> => {
    const flatCmds = EditorAction.flat(NonEmpty.create(childAction));
    const newChildBlocks = applyActions(lens.get(parentBlock), ...flatCmds);
    return {
      type: "update",
      block: lens.set(parentBlock, newChildBlocks),
      selectionBefore: EditorAction.selectionBefore(childAction),
      selectionAfter: EditorAction.selectionAfter(childAction),
    };
  };

  const editor = useMemo<ContentEditor<TBlock>>(
    () => ({
      id: `{${String(parentId)},${parent.id}}`,

      blocks: (() => {
        const block = parent.blocks.find((b) => b.id === parentId);
        return block ? lens.get(block) : [];
      })(),
      revision: parent.revision,

      history: History.map(
        parent.history,
        (parentBlocks) => {
          const block = parentBlocks.find((b) => b.id === parentId);
          return block ? lens.get(block) : [];
        },
        (childAction): EditorAction<TParent> => {
          const parentBlock = parent.history
            .snapshot()
            .state.find((b) => b.id === parentId);
          if (!parentBlock) return { type: "focus", block: { id: parentId } };
          return liftAction(childAction, parentBlock);
        },
      ),

      bus,

      ref(id) {
        return {
          element: parent.ref(parentId).children.get(id) ?? null,
          children: new Map(),
        };
      },

      register(id) {
        return parent.register(parentId, id);
      },

      flush(data) {
        if (!editorRef.current) return;
        bus.dispatchTypedEvent(
          "flush",
          new EditorEvent("flush", editorRef.current, { data }),
        );
        parent.flush(data);
      },

      peek(id, dryRun) {
        if (!editorRef.current) return null;
        if (!dryRun)
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", editorRef.current, { data: undefined }),
          );
        const block = parent.peek(parentId, dryRun);
        if (!block) return null;
        return lens.get(block).find((b) => b.id === id) ?? null;
      },

      push({ data, ...action }) {
        if (!editorRef.current) return;

        bus.dispatchTypedEvent(
          "flush",
          new EditorEvent("flush", editorRef.current, { data }),
        );

        const event = new EditorEvent("push", editorRef.current, {
          action,
          data,
        });
        bus.dispatchTypedEvent("push", event);

        if (event.defaultPrevented) return;

        const parentBlock = parent.peek(parentId, true);
        if (!parentBlock) return;

        parent.push({ data, ...liftAction(action, parentBlock) });
      },

      commit(data) {
        parent.commit(data);
      },

      exec(cmd, id) {
        if (!editorRef.current) return;
        const target = EditorTarget.read(editorRef.current);
        const block = id
          ? editorRef.current.blocks.find((b) => b.id === id)
          : undefined;
        if (!target || (id && !block)) return;
        return ExecCommand(editorRef.current, target, block)(cmd);
      },
    }),
    [parentId, parent, bus, lens],
  );
  editorRef.current = editor;

  const editable = plugin(editor);

  // notify event listeners
  useEffect(() => {
    const event = !isReadyRef.current
      ? new EditorEvent("ready", editor, {})
      : new EditorEvent("postcommit", editor, {});

    editor.bus.dispatchTypedEvent(event.eventType, event);
    isReadyRef.current = true;
  }, [editor]);

  return { editor, editable };
}
