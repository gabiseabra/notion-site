import { autoBind } from "@notion-site/common/utils/object.js";
import { Lens } from "@notion-site/common/utils/optics/lens.js";
import { useEffect, useMemo, useRef } from "react";
import { execCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event";
import { EditorAction, EditorHistoryEntry } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor, ID } from "./types";

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
  const blocks = useMemo(() => {
    const block = parent.blocks.find((b) => b.id === parentId);
    return block ? lens.get(block) : [];
  }, [parent]);

  const narrowId = ({
    id,
    childId,
  }: {
    id: TParent["id"];
    childId?: ID;
  }): { id: TBlock["id"]; childId?: ID } | null => {
    const target = blocks.find((b) => b.id === childId);

    if (!target || id !== parentId) return null;

    return {
      childId: undefined,
      id: target.id,
    };
  };

  const getLatest = (
    parentAction: EditorHistoryEntry<TParent>,
  ): EditorHistoryEntry<TBlock> | null => {
    const localBlocks = blocks ?? [];
    const { targetBefore, targetAfter } = parentAction;
    const { id, childId } =
      parent.history.direction === 1 ? targetAfter : targetBefore;
    const block = localBlocks.find((b) => b.id === childId);

    const action =
      (block && EditorAction.map(parentAction, () => block)) ?? null;

    if (!action || !childId || id !== parentId) {
      return null;
    }

    return {
      ...action,
      targetBefore: {
        ...targetBefore,
        ...narrowId(targetBefore),
      },
      targetAfter: {
        ...targetAfter,
        ...narrowId(targetAfter),
      },
    };
  };

  const editor = useMemo<ContentEditor<TBlock>>(
    () =>
      autoBind({
        id: `{${parent.id},${String(parentId)}}`,

        bus,

        get latest() {
          return parent.latest && getLatest(parent.latest);
        },

        get hasUnsavedChanges() {
          return parent.hasUnsavedChanges;
        },

        blocks,
        revision: parent.revision,

        history: {
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
            return block ? lens.get(block) : [];
          },

          undo(dryRun?: boolean) {
            return parent.history.undo(dryRun);
          },

          redo(dryRun?: boolean) {
            return parent.history.redo(dryRun);
          },
        },

        ref(id) {
          return parent.ref(parentId, id);
        },

        exec(cmd, id) {
          const target = EditorTarget.read(this);
          const block = id ? this.blocks.find((b) => b.id === id) : undefined;
          if (!target || (id && !block)) return;
          return execCommand(this, target, block)(cmd);
        },

        discard(data) {
          parent.discard(data);
        },

        flush(data) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data }),
          );
          parent.flush(data);
        },

        peek(id, flushData) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data: undefined }),
          );
          const block = parent.peek(parentId, flushData);
          if (!block) return null;
          return lens.get(block).find((b) => b.id === id) ?? null;
        },

        push({ data, ...action }) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data }),
          );

          const event = new EditorEvent("push", this, {
            action,
            data,
          });
          bus.dispatchTypedEvent("push", event);

          if (event.defaultPrevented) return;

          const parentBlock = parent.peek(parentId, true);
          if (!parentBlock) return;

          const idBefore = action.targetBefore?.id;
          const idAfter = action.targetAfter?.id;
          parent.push({
            data,
            type: "update",
            block: lens.set(
              parentBlock,
              EditorAction.applyCmd(
                EditorAction.flat([action]),
                lens.get(parentBlock),
              ),
            ),
            targetBefore: {
              ...(action.targetBefore ??
                EditorTarget.end({ id: parentId, childId: idBefore }, parent)),
              id: parentId,
              childId: idBefore,
            },
            targetAfter: {
              ...(action.targetAfter ??
                EditorTarget.end({ id: parentId, childId: idAfter }, parent)),
              id: parentId,
              childId: idAfter,
            },
          });
        },

        commit(data) {
          const event = new EditorEvent("commit", this, {
            blocks: this.blocks,
            revision: this.revision,
            data,
          });
          bus.dispatchTypedEvent("commit", event);

          if (event.defaultPrevented) return;

          parent.commit(data);
        },
      }),
    [parentId, parent, bus],
  );

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
