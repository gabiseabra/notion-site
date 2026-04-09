import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { Lens } from "@notion-site/common/utils/optics/lens.js";
import { useEffect, useMemo, useRef } from "react";
import { ExecCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event";
import { applyActions, EditorAction } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types";

/**
 * Creates a derived `ContentEditor<TBlock>` that provides a scoped view into
 * a single block of a parent editor, using a `Lens` to project a list of child
 * blocks `TBlock[]` from a `TParent`.
 *
 * - History and state are managed by the parent block.
 * - Scoped editors manage their own event bus, events bubble up to the parent,
 *   can be prevented.
 */
export function useEditorLens<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id: parentId,
  editor: parent,
  lens,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  /** Focus on child blocks */
  lens: Lens<TParent, TBlock[]>;
}) {
  // const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const editorRef = useRef<ContentEditor<TBlock>>(null);

  const lensRef = useRef(lens);
  lensRef.current = lens;

  /** Translates a child action into a parent action via the lens. */
  const liftAction = (
    childAction: EditorAction<TBlock>,
    parentBlock: TParent,
  ): EditorAction<TParent> => {
    if (childAction.type === "focus") {
      return {
        type: "focus",
        block: { id: parentId },
        childId: childAction.block.id,
        selectionBefore: childAction.selectionBefore,
        selectionAfter: childAction.selectionAfter,
      };
    }
    const flatCmds = EditorAction.flat(NonEmpty.create(childAction));
    const newChildBlocks = applyActions(
      lensRef.current.get(parentBlock),
      ...flatCmds,
    );
    return {
      type: "update",
      block: lensRef.current.set(parentBlock, newChildBlocks),
      childId: EditorAction.targetAfter(childAction).id,
      selectionBefore: EditorAction.selectionBefore(childAction),
      selectionAfter: EditorAction.selectionAfter(childAction),
    };
  };

  const editor = useMemo<ContentEditor<TBlock>>(
    () => ({
      id: `{${parent.id},${String(parentId)}}`,

      blocks: (() => {
        const block = parent.blocks.find((b) => b.id === parentId);
        return block ? lensRef.current.get(block) : [];
      })(),
      revision: parent.revision,

      history: {
        get action() {
          const localBlocks = editorRef.current?.blocks ?? [];
          const parentAction = parent.history.action;

          const { id, childId } = parentAction
            ? EditorAction.targetAfter(parentAction)
            : {};

          const block = localBlocks.find((b) => b.id === childId);

          const action =
            (parentAction &&
              block &&
              EditorAction.map(parentAction, () => block)) ??
            null;

          if (!action || !childId || id !== parentId) {
            return null;
          }

          if (action.type === "focus" || action.type === "update") {
            delete action.childId;
          }

          return action;
        },
        get position() {
          return parent.history.position;
        },
        get direction() {
          return parent.history.direction;
        },
        getState() {
          const block = parent.history
            .getState()
            .find((b) => b.id === parentId);
          return block ? lensRef.current.get(block) : [];
        },
        undo(dryRun) {
          return parent.history.undo(dryRun);
        },
        redo(dryRun) {
          return parent.history.redo(dryRun);
        },
      },

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
        return lensRef.current.get(block).find((b) => b.id === id) ?? null;
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

        parent.push({ data, ...liftAction(event.detail.action, parentBlock) });
      },

      commit(data) {
        if (!editorRef.current) return;

        const event = new EditorEvent("commit", editorRef.current, {
          blocks: editorRef.current.blocks,
          revision: editorRef.current.revision,
          data,
        });
        bus.dispatchTypedEvent("commit", event);

        if (event.defaultPrevented) return;

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
    [parentId, parent, bus],
  );
  editorRef.current = editor;

  // notify event listeners
  const isReadyRef = useRef(false);
  useEffect(() => {
    const event = !isReadyRef.current
      ? new EditorEvent("ready", editor, {})
      : new EditorEvent("postcommit", editor, {});

    editor.bus.dispatchTypedEvent(event.eventType, event);
    isReadyRef.current = true;
  }, [editor]);

  return editor;
}
