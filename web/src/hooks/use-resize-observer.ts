import { RefObject, useEffect, useRef } from "react";

/**
 * Runs `onResize` when `target` changes size, noop if ResizeObserver is unavailable.
 */
export function useResizeObserver(
  elementOrRef: Element | RefObject<Element | null>,
  onResize: () => void,
  options?: ResizeObserverOptions,
) {
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    const element =
      elementOrRef instanceof Element ? elementOrRef : elementOrRef.current;

    if (!element) {
      if (elementOrRef)
        console.warn(
          `Failed to register resize observer: element not ready on mount`,
        );
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      console.warn(
        `Failed to register resize observer: ResizeObserver nor available`,
      );
      return;
    }

    const ro = new ResizeObserver(() => {
      onResizeRef.current();
    });
    ro.observe(element, options);

    return () => ro.disconnect();
  }, [elementOrRef, options?.box]);
}
