import { never } from "@notion-site/common/utils/error.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { userEvent } from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import { SelectionRange } from "../utils/selection-range.js";
import { SpliceRange } from "../utils/splice-range.js";

export function setupUserEvent() {
  const user = userEvent.setup();
  const proxyDom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  const proxyDoc = proxyDom.window.document;
  const proxyUser = userEvent.setup({
    document: proxyDoc,
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
}

type UserEvent = ReturnType<typeof userEvent.setup> & {
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
  const proxy = user.proxy.doc.createElement("input");
  user.proxy.doc.body.appendChild(proxy);

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
      (e) => {
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

        return new EventClass(e.type, e);
      },
      (e) => {
        // process beforeinput to apply text insertions / deletions to content-editable element
        if (!(e instanceof InputEvent) || e.defaultPrevented) return;
        const selection = SelectionRange.read(proxy);
        const spliceParams =
          selection && SpliceRange.fromInputEvent(e, proxy.value, selection);
        if (spliceParams) {
          element.innerHTML = spliceElementText(
            element,
            spliceParams.offset,
            spliceParams.deleteCount,
            spliceParams.insert,
          ).innerHTML;
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
  post?: (e: HTMLElementEventMap[TEvent], result: boolean | undefined) => void,
) {
  source.addEventListener(eventType, (_e) => {
    const e = map(_e);

    const result = target.dispatchEvent(
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

    post?.(e, result);
  });
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
