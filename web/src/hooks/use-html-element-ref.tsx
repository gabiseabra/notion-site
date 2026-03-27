import { Ref } from "react";

export function useHTMLElementRef<T extends HTMLElement>(
  ref?: Ref<HTMLElement>,
) {
  return (element: T | null) => {
    if (!ref) return;
    if (ref instanceof Function) ref(element);
    else {
      ref.current = element;
    }
  };
}
