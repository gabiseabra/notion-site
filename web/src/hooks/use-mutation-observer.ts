import { RefObject, useEffect, useRef } from "react";

/**
 * Runs `onMutation` when `target` mutates, noop if MutationObserver is unavailable.
 */
export function useMutationObserver(
  elementOrRef: Element | RefObject<Element | null>,
  onMutation: (records: MutationRecord[]) => void,
  options: MutationObserverInit,
) {
  const onMutationRef = useRef(onMutation);
  onMutationRef.current = onMutation;

  useEffect(() => {
    const element =
      elementOrRef instanceof Element ? elementOrRef : elementOrRef.current;

    if (!element) {
      if (elementOrRef)
        console.warn(
          `Failed to register mutation observer: element not ready on mount`,
        );
      return;
    }

    if (typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver((records) => {
      onMutationRef.current(records);
    });
    observer.observe(element, options);

    return () => observer.disconnect();
  }, [
    elementOrRef,
    options.childList,
    options.subtree,
    options.attributes,
    options.attributeFilter,
    options.attributeOldValue,
    options.characterData,
    options.characterDataOldValue,
  ]);
}
