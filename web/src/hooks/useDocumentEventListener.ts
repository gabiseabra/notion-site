import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect } from "react";

export function useDocumentEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (ev: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    document.addEventListener(type, listener, options);
    return () => document.removeEventListener(type, listener, options);
  }, [type, listener, hash(options)]);
}
