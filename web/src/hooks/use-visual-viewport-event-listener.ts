import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect, useRef } from "react";

type VisualViewportEventMap = {
  resize: Event;
  scroll: Event;
};

export function useVisualViewportEventListener<
  K extends keyof VisualViewportEventMap,
>(
  type: K,
  listener: (ev: VisualViewportEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const listenerRef = useRef<(ev: VisualViewportEventMap[K]) => void>(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const f = (e: VisualViewportEventMap[K]) => listenerRef.current(e);
    viewport.addEventListener(type, f, options);
    return () => viewport.removeEventListener(type, f, options);
  }, [type, hash(options)]);
}
