import { autoBind } from "@notion-site/common/utils/object.js";
import { Traversal } from "@notion-site/common/utils/optics/traversal.js";
import { useEffect, useId, useMemo, useRef } from "react";
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
export function useEditorTraversal<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id: parentId,
  editor: parent,
  traversal,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  traversal: Traversal<TParent, TBlock>;
}) {
  const id = useId();
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const blocks = useMemo(() => {
    return parent.blocks
      .filter((block) => block.id === parentId)
      .flatMap((block) => traversal.get(block));
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
        id: `{${parent.id},${id}}`,

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
            return parent.history.getState().flatMap(traversal.get);
          },

          undo(dryRun?: boolean) {
            return parent.history.undo(dryRun);
          },

          redo(dryRun?: boolean) {
            return parent.history.redo(dryRun);
          },
        },

        ref(id) {
          const parentRef = parent.ref(parentId);

          return Object.assign(
            (element: HTMLElement | null) => {
              if (element) {
                parentRef.children.set(id, element);
              } else {
                parentRef.children.delete(id);
              }
            },
            {
              get element() {
                return parentRef.children.get(id) ?? null;
              },
              get children() {
                return new Map();
              },
            },
          );
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

        peek(id, flushData) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data: undefined }),
          );
          const block = parent.peek(parentId, flushData);
          if (!block) return null;
          return traversal.get(block).find((b) => b.id === id) ?? null;
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
            block: traversal.modify(
              parentBlock,
              (block) =>
                EditorAction.applyCmd(EditorAction.flat([action]), [
                  block,
                ]).find((b) => b.id === block.id) ?? block,
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
