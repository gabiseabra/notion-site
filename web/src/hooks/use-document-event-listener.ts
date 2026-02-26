import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect, useRef } from "react";

export function useDocumentEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (ev: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const f: typeof listener = (e) => listenerRef.current(e);
    document.addEventListener(type, f, options);
    return () => document.removeEventListener(type, f, options);
  }, [type, hash(options)]);
}
