import { never } from "@notion-site/common/utils/error.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { userEvent } from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import { spliceElementText } from "../utils/dom-splice.js";
import { getInputEventSpliceParams } from "../utils/event.js";
import { getSelectionRange, setSelectionRange } from "../utils/selection.js";

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
        setSelectionRange(element, getSelectionRange(proxy));

        if (
          hash(getSelectionRange(proxy)) !== hash(getSelectionRange(element))
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
        const selection = getSelectionRange(proxy);
        const spliceParams =
          selection &&
          getInputEventSpliceParams(e, proxy.value.length, selection);
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
  setSelectionRange(proxy, getSelectionRange(element));

  await act(proxy, user.proxy);

  setSelectionRange(element, {
    start: proxy.selectionStart ?? 0,
    end:
      proxy.selectionEnd === proxy.selectionStart ? null : proxy.selectionEnd,
  });
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
