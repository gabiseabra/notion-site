import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { ContentEditorPlugin } from "../editable/types.js";
import { EditorEvent, EditorEventTarget } from "./editor-event.js";
import {
  applyActions,
  EditorActionCmd,
  EditorHistory,
} from "./editor-history.js";
import { AnyBlock, ContentEditor, EditorBatch, ID } from "./types.js";

/**
 * Creates shared state & controller for the editor plugins.
 *
 * @typeParam TEventMap - Map of event types. Must be explicitly provided when
 * using plugins that emit events.
 */
export function useContentEditor<TBlock extends AnyBlock, TDetail>({
  initialValue,
  plugin,
  onChange,
}: {
  initialValue: TBlock[];
  plugin: ContentEditorPlugin<TBlock, TDetail>;
  onChange?: (blocks: TBlock[]) => void;
}) {
  const isReadyRef = useRef(false);
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
  const [snapshot, setSnapshot] = useState(() => history.snapshot());
  const blocksRef = useRef<Map<TBlock["id"], HTMLElement | null>>(new Map());
  const batchRef = useRef<EditorBatch<TBlock> | undefined>(undefined);

  /** Editor internals */

  const editorRef = useRef<ContentEditor<TBlock>>(null);

  /** Flush pending changes */
  function flush(skipHistory = false) {
    if (!batchRef.current) return false;

    const { commands } = batchRef.current;

    batchRef.current = undefined;

    if (!NonEmpty.isNonEmpty(commands) || skipHistory) return false;

    history.push({
      type: "apply",
      commands,
    });

    return true;
  }

  function push(cmd: EditorActionCmd<TBlock>, batchId?: ID) {
    if (batchRef.current && batchRef.current.batchId === batchId) {
      batchRef.current.commands.push(cmd);
    } else if (batchId) {
      flush();
      batchRef.current = {
        batchId,
        commands: [cmd],
      };
    } else {
      history.push(cmd);
    }
  }

  const editor = useMemo<ContentEditor<TBlock>>(
    () => ({
      blocks: snapshot.state,
      revision: snapshot.position,
      history,
      bus,

      inBatch(exceptId) {
        return !!batchRef.current && batchRef.current.batchId !== exceptId;
      },

      flush(data) {
        if (!editorRef.current || !batchRef.current) return false;

        const event = new EditorEvent("flush", editorRef.current, {
          batchId: batchRef.current.batchId,
          commands: batchRef.current.commands,
          data,
        });
        bus.dispatchTypedEvent("flush", event);

        return flush(event.defaultPrevented);
      },

      peek(id) {
        const state = history.getState();

        return (
          (batchRef.current
            ? applyActions(state, ...batchRef.current.commands)
            : state
          ).find((block) => block.id === id) ?? null
        );
      },

      ref(id) {
        return blocksRef.current.get(id) ?? null;
      },

      update(block, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          cmd: {
            type: "update",
            block,
            selectionBefore: options?.selectionBefore,
            selectionAfter: options?.selectionAfter,
          },
          batchId: options?.batchId ?? batchRef.current?.batchId,
          data: options?.data,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        push(event.detail.cmd, options?.batchId);
      },

      remove(block, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          cmd: {
            type: "remove",
            block,
            selectionBefore: options?.selectionBefore,
            selectionAfter: options?.selectionAfter,
          },
          batchId: options?.batchId ?? batchRef.current?.batchId,
          data: options?.data,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        push(event.detail.cmd, options?.batchId);
      },

      split(left, right, options) {
        if (!editorRef.current) return;

        const event = new EditorEvent("edit", editorRef.current, {
          cmd: {
            type: "split",
            left,
            right,
            selectionBefore: options?.selectionBefore,
            selectionAfter: options?.selectionAfter,
          },
          batchId: options?.batchId ?? batchRef.current?.batchId,
          data: options?.data,
        });
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        push(event.detail.cmd, options?.batchId);
      },

      commit(data) {
        if (!editorRef.current) return;

        flush();

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
      onChange?.(editor.blocks);
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
