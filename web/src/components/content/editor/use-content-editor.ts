import { useEffect, useMemo, useRef, useState } from "react";
import { ContentEditorPlugin } from "../editable/types.js";
import { EditorEvent, EditorEventTarget } from "./editor-event.js";
import { EditorHistory } from "./editor-history.js";
import { AnyBlock, ContentEditor } from "./types.js";

/**
 * Creates shared state & controller for the editor plugins.
 *
 * @typeParam TEventMap - Map of event types. Must be explicitly provided when
 * using plugins that emit events.
 */
export function useContentEditor<TBlock extends AnyBlock, TDetail>({
  initialValue,
  plugin,
  onReady,
  onCommit,
  onPostCommit,
}: {
  initialValue: TBlock[];
  plugin: ContentEditorPlugin<TBlock, TDetail>;
  onReady?: () => void;
  onCommit?: (blocks: TBlock[]) => void;
  onPostCommit?: (blocks: TBlock[]) => void;
}) {
  const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
  const [snapshot, setSnapshot] = useState(() => history.snapshot());
  const blocksRef = useRef<Map<TBlock["id"], HTMLElement | null>>(new Map());

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
      blocks: snapshot.state,
      revision: snapshot.position,
      history,
      bus,

      ref(id) {
        return blocksRef.current.get(id) ?? null;
      },

      flush(data?: unknown) {
        if (!editorRef.current) return;

        bus.dispatchTypedEvent(
          "flush",
          new EditorEvent("flush", editorRef.current, { data }),
        );
      },

      peek(id) {
        if (!editorRef.current) return null;

        return history.getState().find((block) => block.id === id) ?? null;
      },

      push(action, data) {
        if (!editorRef.current) return;

        const event = new EditorEvent("push", editorRef.current, {
          action,
          data,
        });
        bus.dispatchTypedEvent("push", event);

        if (event.defaultPrevented) return;

        history.push(event.detail.action);
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

  // run plugins' hook phase
  const editable = plugin(editor);

  // notify event listeners
  useEffect(() => {
    const event = !isReadyRef.current
      ? new EditorEvent("ready", editor, {})
      : new EditorEvent("postcommit", editor, {});

    if (isReadyRef.current) {
      onPostCommitRef.current?.(editor.blocks);
    } else {
      onReadyRef.current?.();
    }

    editor.bus.dispatchTypedEvent(event.eventType, event);
    isReadyRef.current = true;
  }, [history, editor]);

  return {
    editor,
    editable: (block: TBlock) => ({
      ...editable(block),
      ref(element: HTMLElement | null) {
        blocksRef.current.set(block.id, element);
      },
    }),
  };
}
