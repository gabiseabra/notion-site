import { RefObject, useEffect } from "react";

/**
 * Runs `onResize` when `target` changes size, noop if ResizeObserver is unavailable.
 */
export function useResizeObserver(
  elementOrRef: Element | RefObject<Element | null>,
  onResize: () => void,
) {
  useEffect(() => {
    const element =
      elementOrRef instanceof Element ? elementOrRef : elementOrRef.current;

    if (!element || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => onResize());
    ro.observe(element);

    return () => ro.disconnect();
  }, []);
}
