import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect, useRef } from "react";

export function useWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const f: typeof listener = (e) => listenerRef.current(e);
    window.addEventListener(type, f, options);
    return () => window.removeEventListener(type, f, options);
  }, [type, hash(options)]);
}
