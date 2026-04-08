import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { Lens } from "@notion-site/common/utils/optics/lens.js";
import { Prism } from "@notion-site/common/utils/optics/prism.js";
import { useMemo, useRef } from "react";
import { useEventListener } from "../../../hooks/use-event-listener";
import { ExecCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event";
import { applyActions, EditorAction } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types";

/**
 * Creates a derived `ContentEditor<TBlock>` that provides a scoped view into
 * a single block of a parent editor, using a `Lens` to project `TBlock[]`
 * from a `TParent`.
 *
 * ## State
 * - `blocks` — `lens.get` applied to the parent block matched by `id`.
 *   Empty if the parent block is not found.
 * - `revision` — Same as the parent's. No independent revision counter.
 * - `id` — Composite `{parentId,parent.id}`.
 *
 * ## History
 * Exposes a mapped view of the parent's history. There is no independent history.
 * - **Reads** (`snapshot`, `position`, `direction`, `undo`, `redo`) delegate to
 *   the parent history, with state projected through the lens.
 * - **Writes** (`push`) lift the child action through the lens and push it to
 *   the parent history.
 * - If the parent block is no longer found when lifting, the action degrades
 *   to a no-op `"focus"`.
 *
 * ## Event bus
 * The child has its own `EditorEventTarget`.
 * - **Downward:** `ready` and `postcommit` from the parent are forwarded to
 *   the child's bus.
 * - **Upward:** `flush` and `push` are dispatched on the child's bus first,
 *   then forwarded to the parent.
 *
 * ## push
 * 1. Flushes the child bus (settles pending changes from child plugins).
 * 2. Dispatches a `push` event on the child bus. Child plugins may
 *    `preventDefault` to cancel, or mutate `event.detail.action` before
 *    it propagates.
 * 3. If not prevented: lifts the (possibly modified) child action through
 *    the lens into a parent `"update"` action, and calls `parent.push` —
 *    triggering the parent's own push lifecycle.
 *
 * ## flush
 * Dispatches `flush` on the child bus, then forwards to the parent.
 *
 * ## peek
 * Returns the latest state for a child block by id.
 *
 * ## commit
 * Delegates to the parent. The child shares the parent's history, so there
 * is no child-level state to commit.
 *
 * ## exec
 * Fully local to the child editor. Reads the target and block from the
 * child's own state.
 *
 * ## DOM refs
 * - `ref(id)` returns the DOM element registered for a child block.
 * - `register(id)` returns a ref callback to register a child block's DOM
 *   element, scoped under the parent block.
 *
 * @param id - The id of the parent block to focus on.
 * @param editor - The parent `ContentEditor`.
 * @param lens - A `Lens<TParent, TBlock[]>` that extracts/injects child
 *   blocks from/into the parent block.
 */
export function useEditorLens<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id: parentId,
  editor: parent,
  lens,
  prism,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  lens: Lens<TParent, TBlock[]>;
  prism?: Prism<TParent, TBlock>;
}) {
  // const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const editorRef = useRef<ContentEditor<TBlock>>(null);

  const lensRef = useRef(lens);
  lensRef.current = lens;

  const prismRef = useRef(prism);
  prismRef.current = prism;

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
      id: `{${String(parentId)},${parent.id}}`,

      blocks: (() => {
        const block = parent.blocks.find((b) => b.id === parentId);
        return block ? lensRef.current.get(block) : [];
      })(),
      revision: parent.revision,

      history: {
        get action() {
          const parentAction = parent.history.action;
          const action =
            (prismRef.current &&
              parentAction &&
              EditorAction.preview(parentAction, prismRef.current)) ??
            null;
          const { id, childId } = parentAction
            ? EditorAction.targetAfter(parentAction)
            : {};

          if (
            !parentAction ||
            !action ||
            !childId ||
            id !== parentId ||
            !editorRef.current?.blocks.some((b) => b.id === childId)
          ) {
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
          parent.history.undo(dryRun);
        },
        redo(dryRun) {
          parent.history.redo(dryRun);
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
  useEventListener(parent.bus, "ready", (event) =>
    queueMicrotask(() =>
      editor.bus.dispatchTypedEvent(
        event.eventType,
        new EditorEvent("ready", editor, {}),
      ),
    ),
  );
  useEventListener(parent.bus, "postcommit", (event) =>
    queueMicrotask(() =>
      editor.bus.dispatchTypedEvent(
        event.eventType,
        new EditorEvent("postcommit", editor, {}),
      ),
    ),
  );

  // useEffect(() => {
  //   const event = !isReadyRef.current
  //     ? new EditorEvent("ready", editor, {})
  //     : new EditorEvent("postcommit", editor, {});

  //   editor.bus.dispatchTypedEvent(event.eventType, event);
  //   isReadyRef.current = true;
  // }, [editor]);

  return editor;
}
