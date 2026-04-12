import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ExecCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event.js";
import { EditorAction, EditorHistory } from "./editor-history.js";
import { EditorRef } from "./editor-ref.js";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor, ID } from "./types.js";

/**
 * Creates shared state & controller for the editor plugins.
 */
export function useContentEditor<TBlock extends AnyBlock>({
  initialValue,
  onReady,
  onCommit,
  onPostCommit,
}: {
  initialValue: TBlock[];
  onReady?: () => void;
  onCommit?: (blocks: TBlock[]) => void;
  onPostCommit?: (blocks: TBlock[]) => void;
}) {
  const id = useId();

  const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
  const [snapshot, setSnapshot] = useState(() => history.snapshot());
  const blocksRef = useRef<EditorRef.Map<TBlock>>(new Map());

  /** Callback refs */

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const onPostCommitRef = useRef(onPostCommit);
  onPostCommitRef.current = onPostCommit;

  /** Editor internals */

  const editorRef = useRef<ContentEditor<TBlock>>(null);
  const editor = useMemo<ContentEditor<TBlock>>(
    () => ({
      get latest() {
        return history.action;
      },

      get hasUnsavedChanges() {
        return history.position > snapshot.position;
      },

      id,

      blocks: snapshot.state,
      revision: snapshot.position,
      history,
      bus,

      ref(id, childId) {
        const emptyMap: Map<ID, HTMLElement> = new Map();

        function get() {
          let ref = blocksRef.current.get(id);

          if (!ref) {
            ref ??= {
              children: emptyMap,
              element: null,
            };
            blocksRef.current.set(id, ref);
          }

          return ref;
        }

        return Object.assign(
          (element: HTMLElement | null) => {
            if (typeof childId === "undefined") {
              get().element = element;
            } else if (element) {
              get().children.set(childId, element);
            } else {
              get().children.delete(childId);
            }
          },
          {
            get element() {
              if (typeof childId === "undefined") return get().element;
              return get().children.get(childId) ?? null;
            },
            get children() {
              if (typeof childId === "undefined") return get().children;
              return emptyMap;
            },
          },
        );
      },

      exec(cmd, id) {
        if (!editorRef.current) return;
        const target = EditorTarget.read(editorRef.current);
        const block = id ? snapshot.state.find((b) => b.id === id) : undefined;

        if (id && !block) return;

        return ExecCommand(editorRef.current, target, block)(cmd);
      },

      /** EditorChangeset implementation */

      discard(data) {
        this.flush(data);
        while (history.position > snapshot.position) history.undo();
      },

      flush(data?: unknown) {
        if (!editorRef.current) return;

        bus.dispatchTypedEvent(
          "flush",
          new EditorEvent("flush", editorRef.current, { data }),
        );
      },

      peek(id, data) {
        this.flush(data);

        return history.getState().find((block) => block.id === id) ?? null;
      },

      push({ data, ...action }) {
        if (!editorRef.current) return;

        this.flush(data);

        const event = new EditorEvent("push", editorRef.current, {
          action,
          data,
        });
        bus.dispatchTypedEvent("push", event);

        if (event.defaultPrevented) return;

        const [cmd] = EditorAction.flat([action]);
        const idBefore = cmd.type === "split" ? cmd.left.id : cmd.block.id;
        const idAfter = cmd.type === "split" ? cmd.right.id : cmd.block.id;

        history.push({
          ...action,
          targetBefore:
            action.targetBefore ??
            history.action?.targetAfter ??
            EditorTarget.start({ id: idBefore }),
          targetAfter:
            action.targetAfter ??
            EditorTarget.end({ id: idAfter }, editorRef.current),
        });
      },

      commit(data) {
        if (!editorRef.current) return;

        const snapshot = history.snapshot();

        const event = new EditorEvent("commit", editorRef.current, {
          blocks: snapshot.state,
          revision: snapshot.position,
          data: data,
        });
        bus.dispatchTypedEvent("commit", event);

        if (event.defaultPrevented) return;

        setSnapshot({
          state: event.detail.blocks,
          position: event.detail.revision,
        });
        onCommitRef.current?.(event.detail.blocks);
      },
    }),
    [bus, history, snapshot],
  );
  editorRef.current = editor;

  // notify event listeners
  useEffect(() => {
    const event = !isReadyRef.current
      ? new EditorEvent("ready", editor, {})
      : new EditorEvent("postcommit", editor, {});

    editor.bus.dispatchTypedEvent(event.eventType, event);
    isReadyRef.current = true;

    if (event.eventType === "postcommit") {
      onPostCommitRef.current?.(editor.blocks);
    } else {
      onReadyRef.current?.();
    }
  }, [editor]);

  return editor;
}
