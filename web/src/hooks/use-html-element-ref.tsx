import { Ref } from "react";

export function useHTMLElementRef<T extends HTMLElement>(
  ref?: Ref<HTMLElement>,
): Ref<T | null> {
  return (element) => {
    if (!ref) return;
    if (ref instanceof Function) ref(element);
    else {
      ref.current = element;
    }
  };
}
