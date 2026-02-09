import { never } from "@notion-site/common/utils/error.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { userEvent as _userEvent } from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import { RefObject } from "react";
import { SelectionRange } from "../utils/selection-range.js";
import { SpliceRange } from "../utils/splice-range.js";

export const userEvent = {
  setup(options?: { fakeTimers?: boolean }) {
    const user = _userEvent.setup({
      ...(options?.fakeTimers
        ? { advanceTimers: jest.advanceTimersByTime }
        : {}),
    });
    const proxyDom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    const proxyDoc = proxyDom.window.document;
    const proxyUser = _userEvent.setup({
      document: proxyDoc,
      ...(options?.fakeTimers
        ? { advanceTimers: jest.advanceTimersByTime }
        : {}),
    });

    const baseUser: UserEvent = {
      ...user,

      proxy: {
        ...proxyUser,

        dom: proxyDom,
        doc: proxyDoc,

        get proxy() {
          return baseUser.proxy;
        },
      },
    };

    return {
      ...baseUser,

      /**
       * Simulate keyboard input on a contenteditable element.
       *
       * Problem: @testing-library/user-event doesn't fire `beforeinput` events
       * for contenteditable elements - only for `<input>` and `<textarea>`.
       *
       * Approach: Create a proxy `<input>` in a separate JSDOM instance,
       * type into it, and forward the `beforeinput`/`input`/`keydown` events
       * to the real contenteditable.
       */
      async input(element: HTMLElement, keys: string) {
        await forwardInputEvents(baseUser, element, async (proxy, user) => {
          await user.keyboard(keys);
        });
      },
    };
  },
};

type UserEvent = ReturnType<typeof _userEvent.setup> & {
  proxy: UserEvent & {
    dom: JSDOM;
    doc: Document;
  };
};

/**
 * Perform some action on proxy element, while forwarding `input` and `beforeinput`
 * events to the target element, preserving selection.
 * @testing-library/user-event doesn't fire beforeinput for non-input elements,
 * so this is needed in order to replicate the content-editable behaviour.
 */
async function forwardInputEvents(
  user: UserEvent,
  element: HTMLElement,
  act: (proxy: HTMLElement, user: UserEvent) => Promise<void>,
) {
  const proxy = user.proxy.doc.createElement("textarea");
  user.proxy.doc.body.appendChild(proxy);

  const keydownModifiers: RefObject<{
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
  } | null> = { current: null };

  // Forward events from proxy to target
  for (const [eventType, EventClass] of [
    ["beforeinput", InputEvent],
    ["input", Event],
    ["keydown", KeyboardEvent],
  ] as const) {
    forwardEvent(
      element,
      proxy,
      eventType,
      (_e) => {
        // Track keydown modifiers for inputType patching
        if (isEventType("keydown", _e)) {
          keydownModifiers.current = {
            altKey: _e.altKey,
            metaKey: _e.metaKey,
            ctrlKey: _e.ctrlKey,
          };
        }
        // Copy selection from proxy to target before dispatching
        SelectionRange.applyMaybe(element, SelectionRange.read(proxy));

        if (
          hash(SelectionRange.read(proxy)) !==
          hash(SelectionRange.read(element))
        ) {
          never(
            "failed to copy selection from proxy to target! this shouldn't happen . . .",
          );
        }

        // Patch inputType for word/line delete based on modifier keys
        if (keydownModifiers.current && isEventType("beforeinput", _e)) {
          return new InputEvent(_e.type, {
            inputType: getPatchedInputType(
              _e.inputType,
              keydownModifiers.current,
            ),
            data: _e.data,
            dataTransfer: _e.dataTransfer,
            isComposing: _e.isComposing,
            detail: _e.detail,
          });
        } else {
          return new EventClass(_e.type, _e);
        }
      },
      (e, _e) => {
        // process beforeinput to apply text insertions / deletions to content-editable element
        if (!isEventType("beforeinput", e) || e.defaultPrevented) return;
        const selection = SelectionRange.read(proxy);
        const spliceParams =
          selection && SpliceRange.fromInputEvent(e, proxy.value, selection);

        if (!spliceParams) return;

        element.innerHTML = spliceElementText(
          element,
          spliceParams.offset,
          spliceParams.deleteCount,
          spliceParams.insert,
        ).innerHTML;
        // testing-library doesn't handle word/line delete, so we need to apply the correct
        // splice to the proxy in this case too
        if (spliceParams.deleteCount > 1 && isWordOrLineDelete(e.inputType)) {
          proxy.value = SpliceRange.apply(proxy.value, spliceParams);
          SelectionRange.apply(
            proxy,
            SpliceRange.toSelectionRange(spliceParams, 1),
          );
          _e.preventDefault();
        }
      },
    );
  }

  // Copy text content and selection state to the proxy
  proxy.value = element.textContent ?? "";
  proxy.focus();
  SelectionRange.applyMaybe(proxy, SelectionRange.read(element));

  await act(proxy, user.proxy);

  const start = proxy.selectionStart ?? 0;
  const end = proxy.selectionEnd ?? start;
  SelectionRange.apply(element, { start, end });
}

function forwardEvent<TEvent extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  source: HTMLElement,
  eventType: TEvent,
  map: (e: HTMLElementEventMap[TEvent]) => HTMLElementEventMap[TEvent],
  post?: (
    e: HTMLElementEventMap[TEvent],
    proxy: HTMLElementEventMap[TEvent],
  ) => void,
) {
  source.addEventListener(eventType, (_e) => {
    const e = map(_e);

    target.dispatchEvent(
      Object.defineProperties(e, {
        target: {
          get() {
            return target;
          },
        },
      }),
    );

    if (e.defaultPrevented) {
      _e.preventDefault();
    }

    post?.(e, _e);
  });
}

/** Helper guard that works with non-global instances of dom (instanceof doesn't) */
function isEventType<T extends keyof HTMLElementEventMap>(
  type: T,
  event: Event,
): event is HTMLElementEventMap[T] {
  return event.type === type;
}

function getPatchedInputType(
  inputType: string,
  modifiers: { altKey: boolean; metaKey: boolean; ctrlKey: boolean },
): string {
  if (inputType === "deleteContentBackward") {
    if (modifiers.metaKey) return "deleteSoftLineBackward";
    if (modifiers.altKey) return "deleteWordBackward";
  }
  if (inputType === "deleteContentForward") {
    if (modifiers.altKey) return "deleteWordForward";
    if (modifiers.ctrlKey) return "deleteSoftLineForward";
  }
  return inputType;
}

function isWordOrLineDelete(inputType: string): boolean {
  return (
    inputType === "deleteWordBackward" ||
    inputType === "deleteWordForward" ||
    inputType === "deleteSoftLineBackward" ||
    inputType === "deleteSoftLineForward"
  );
}

/**
 * Splice text content in an HTMLElement, preserving inner tag structure.
 * Returns a cloned element with the modifications applied.
 *
 * Works like String.prototype.splice - delete `deleteCount` characters
 * starting at `offset`, then insert `text` at that position.
 */
export function spliceElementText<T extends HTMLElement>(
  element: T,
  offset: number,
  deleteCount: number,
  text: string,
): T {
  const clone = element.cloneNode(true) as T;
  const nodes = collectTextNodes(clone);

  if (nodes.length === 0) {
    clone.textContent = text;
    return clone;
  }

  const start = findPosition(nodes, offset);
  const end = findPosition(nodes, offset + deleteCount);

  if (start.node === end.node) {
    start.node.data =
      start.node.data.slice(0, start.offset) +
      text +
      start.node.data.slice(end.offset);
  } else {
    start.node.data = start.node.data.slice(0, start.offset) + text;
    end.node.data = end.node.data.slice(end.offset);

    let between = false;
    for (const n of nodes) {
      if (n === start.node) {
        between = true;
        continue;
      }
      if (n === end.node) break;
      if (between) n.remove();
    }
    if (!end.node.data) end.node.remove();
  }

  return clone;
}

function collectTextNodes(el: HTMLElement): Text[] {
  const result: Text[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) result.push(walker.currentNode);
  }
  return result;
}

function findPosition(
  nodes: Text[],
  offset: number,
): { node: Text; offset: number } {
  let remaining = offset;
  for (const node of nodes) {
    if (remaining <= node.data.length) return { node, offset: remaining };
    remaining -= node.data.length;
  }
  const last = nodes[nodes.length - 1];
  return { node: last, offset: last.data.length };
}
