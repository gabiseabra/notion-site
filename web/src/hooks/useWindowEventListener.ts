import { hash } from "@notion-site/common/utils/hash.js";
import { useEffect } from "react";

export function useWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener(type, listener, options);
    return () => window.removeEventListener(type, listener, options);
  }, [type, listener, hash(options)]);
}
