import { DependencyList, useEffect, useMemo, useRef } from "react";

/**
 * Returns a stable function that schedules the latest callback to run once on the
 * next animation frame. Multiple calls within the same frame collapse into one.
 *
 * Use this to throttle layout reads/writes triggered by high-frequency events
 * like scroll and resize.
 */
export function useRafThrottledCallback(fn: () => void, deps: DependencyList) {
  const rafRef = useRef<number>(null);
  const fnRef = useRef(() => {});
  fnRef.current = fn;

  const cancel = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  useEffect(() => () => cancel(), deps);

  return useMemo(
    () =>
      Object.assign(
        () => {
          cancel();
          rafRef.current = requestAnimationFrame(fnRef.current);
        },
        { cancel },
      ),
    deps,
  );
}
