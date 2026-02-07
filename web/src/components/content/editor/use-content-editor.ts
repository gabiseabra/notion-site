import { isNonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorEvent, EditorEventTarget } from "./event.js";
import { EditorCommand, EditorHistory } from "./history.js";
import { AnyBlock, ContentEditor } from "./types.js";

/**
 * Creates shared state & controller for the editor plugins.
 *
 * @typeParam TEventMap - Map of event types. Must be explicitly provided when
 * using plugins that emit events.
 */
export function useContentEditor<TBlock extends AnyBlock>({
  initialValue,
}: {
  initialValue: TBlock[];
}): ContentEditor<TBlock> {
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
  const [snapshot, setSnapshot] = useState(() => history.snapshot());

  const blocksRef = useRef<Map<string, HTMLElement | null>>(new Map());
  const txRef = useRef<EditorCommand<TBlock>[] | null>(null);

  const editorRef = useRef<ContentEditor<TBlock>>(null);
  const editor = useMemo<ContentEditor<TBlock>>(
    () => ({
      blocks: snapshot.state,
      revision: snapshot.position,
      blocksRef,
      bus,
      history,

      get isDirty() {
        return history.currentPosition !== snapshot.position;
      },

      get(id) {
        return snapshot.state.find((block) => block.id === id) ?? null;
      },

      peek(id) {
        editorRef.current?.flush();
        if (editorRef.current?.isDirty) {
          return history.getState().find((block) => block.id === id) ?? null;
        } else {
          return snapshot.state.find((block) => block.id === id) ?? null;
        }
      },

      ref(id) {
        return blocksRef.current.get(id) ?? null;
      },

      update(block, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          type: "update",
          block,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(event.detail);
        else history.push(event.detail);
      },

      remove(block, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          type: "remove",
          block,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(event.detail);
        else history.push(event.detail);
      },

      split(left, right, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          type: "split",
          left,
          right,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(event.detail);
        else history.push(event.detail);
      },

      transaction(fn) {
        txRef.current ??= [];
        fn();
        const commands = txRef.current;
        txRef.current = null;

        if (!isNonEmpty(commands)) return;

        history.push({
          type: "apply",
          commands: EditorCommand.flat(commands),
          selectionBefore: commands.find((cmd) => cmd.selectionBefore)
            ?.selectionBefore,
          selectionAfter: [...commands]
            .reverse()
            .find((cmd) => cmd.selectionAfter)?.selectionAfter,
        });
      },

      flush() {
        if (!editorRef.current) return false;

        const event = new EditorEvent("flush", editorRef.current, {});
        bus.dispatchTypedEvent("flush", event);

        return !event.defaultPrevented;
      },

      commit() {
        if (!editorRef.current) return;

        editorRef.current.flush();
        const snapshot = history.snapshot();

        const event = new EditorEvent("commit", editorRef.current, {
          blocks: snapshot.state,
          revision: snapshot.position,
        });
        bus.dispatchTypedEvent("commit", event);
        if (event.defaultPrevented) return;

        setSnapshot(snapshot);
      },
    }),
    [bus, history, snapshot],
  );
  editorRef.current = editor;

  const isInitialRef = useRef(true);

  useEffect(() => {
    const cmd = editor.history.command;
    const event = !cmd
      ? isInitialRef.current
        ? new EditorEvent("ready", editor, {})
        : new EditorEvent("reset", editor, {})
      : new EditorEvent("push", editor, {});

    editor.bus.dispatchTypedEvent(event.eventType, event);
  }, [editor]);

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  return editor;
}
