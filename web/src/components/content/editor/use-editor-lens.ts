import { Lens } from "@notion-site/common/utils/optics/lens.js";
import { useEffect, useMemo, useRef } from "react";
import { ExecCommand } from "./editor-command";
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
  const editorRef = useRef<ContentEditor<TBlock>>(null);

  const lensRef = useRef(lens);
  lensRef.current = lens;

  const narrowId = ({
    id,
    childId,
  }: {
    id: TParent["id"];
    childId?: ID;
  }): { id: TBlock["id"]; childId?: ID } | null => {
    const target = editorRef.current?.blocks.find((b) => b.id === childId);

    if (!target || id !== parentId) return null;

    return {
      childId: undefined,
      id: target.id,
    };
  };

  const getLatest = (
    parentAction: EditorHistoryEntry<TParent>,
  ): EditorHistoryEntry<TBlock> | null => {
    const localBlocks = editorRef.current?.blocks ?? [];
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
    () => ({
      id: `{${parent.id},${String(parentId)}}`,

      bus,

      get latest() {
        return parent.latest && getLatest(parent.latest);
      },

      get hasUnsavedChanges() {
        return parent.hasUnsavedChanges;
      },

      blocks: (() => {
        const block = parent.blocks.find((b) => b.id === parentId);
        return block ? lensRef.current.get(block) : [];
      })(),
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
          return block ? lensRef.current.get(block) : [];
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
        if (!editorRef.current) return;
        const target = EditorTarget.read(editorRef.current);
        const block = id
          ? editorRef.current.blocks.find((b) => b.id === id)
          : undefined;
        if (!target || (id && !block)) return;
        return ExecCommand(editorRef.current, target, block)(cmd);
      },

      discard(data) {
        parent.discard(data);
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

        const idBefore = action.targetBefore?.id;
        const idAfter = action.targetAfter?.id;
        parent.push({
          data,
          type: "update",
          block: lensRef.current.set(
            parentBlock,
            EditorAction.applyCmd(
              EditorAction.flat([event.detail.action]),
              lens.get(parentBlock),
            ),
          ),
          targetBefore: {
            ...(action.targetBefore ??
              EditorTarget.end(parent, parentId, idBefore)),
            id: parentId,
            childId: idBefore,
          },
          targetAfter: {
            ...(action.targetAfter ??
              EditorTarget.end(parent, parentId, idAfter)),
            id: parentId,
            childId: idAfter,
          },
        });
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
