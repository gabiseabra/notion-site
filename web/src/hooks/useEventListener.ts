import { hash } from "@notion-site/common/utils/hash.js";
import { RefObject, useEffect } from "react";
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
  elementOrRef: TTarget | RefObject<TTarget>,
  type: TEventType,
  listener: (ev: ExtractEventMap<TTarget>[TEventType]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const element =
    elementOrRef && "current" in elementOrRef
      ? elementOrRef.current
      : elementOrRef;

  useEffect(() => {
    if (!element) return;
    if (element instanceof HTMLElement) {
      element.addEventListener(type, listener, options);
      return () => element.removeEventListener(type, listener, options);
    }
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
  }, [element, type, listener, hash(options)]);
}
