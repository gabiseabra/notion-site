import { hash } from "@notion-site/common/utils/hash.js";
import { RefObject, useEffect, useRef } from "react";
import { TypedEventTarget } from "typescript-event-target";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventTarget = HTMLElement | TypedEventTarget<any>;

type ExtractEventMap<TTarget> =
  TTarget extends TypedEventTarget<infer T>
    ? T
    : TTarget extends HTMLElement
      ? HTMLElementEventMap
      : never;

export function useEventListener<
  TTarget extends EventTarget,
  TEventType extends keyof ExtractEventMap<TTarget> & string,
>(
  elementOrRef: TTarget | RefObject<TTarget> | null,
  type: TEventType,
  listener: (ev: ExtractEventMap<TTarget>[TEventType]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const element =
    elementOrRef && "current" in elementOrRef
      ? elementOrRef.current
      : elementOrRef;

  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    if (!element) return;
    const f: typeof listener = (e) => listenerRef.current(e);
    if (element instanceof HTMLElement) {
      element.addEventListener(type, f, options);
      return () => element.removeEventListener(type, f, options);
    } else {
      element.addEventListener(type, f, options);
      return () => element.removeEventListener(type, f, options);
    }
  }, [element, type, hash(options)]);
}
