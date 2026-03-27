import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ContentEditorPlugin } from "../editable/types.js";
import { ExecCommand } from "./editor-command";
import { EditorEvent, EditorEventTarget } from "./editor-event.js";
import { EditorHistory } from "./editor-history.js";
import { EditorTarget } from "./editor-target";
import { AnyBlock, BlockRef, ContentEditor } from "./types.js";

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
  const id = useId();

  const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
  const [snapshot, setSnapshot] = useState(() => history.snapshot());
  const blocksRef = useRef<Map<TBlock["id"], BlockRef>>(new Map());

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
      id,

      blocks: snapshot.state,
      revision: snapshot.position,
      history,
      bus,

      ref(id) {
        let ref = blocksRef.current.get(id);

        if (!ref) {
          ref ??= {
            children: new Map(),
            element: null,
          };
          blocksRef.current.set(id, ref);
        }

        return ref;
      },

      register(id, childId) {
        return (element: HTMLElement | null) => {
          if (typeof childId === "undefined") {
            this.ref(id).element = element;
          } else if (element) {
            this.ref(id).children.set(childId, element);
          } else {
            this.ref(id).children.delete(childId);
          }
        };
      },

      flush(data?: unknown) {
        if (!editorRef.current) return;

        bus.dispatchTypedEvent(
          "flush",
          new EditorEvent("flush", editorRef.current, { data }),
        );
      },

      peek(id, dryRun) {
        if (!editorRef.current) return null;

        if (!dryRun) this.flush();

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

      exec(cmd, id) {
        if (!editorRef.current) return;
        const target = EditorTarget.read(editorRef.current);
        const block = id ? snapshot.state.find((b) => b.id === id) : undefined;

        if (!target || (id && !block)) return;

        return ExecCommand(editorRef.current, target, block)(cmd);
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
    editable,
  };
}
