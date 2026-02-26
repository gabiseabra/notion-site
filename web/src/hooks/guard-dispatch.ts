import { hash } from "@notion-site/common/utils/hash.js";
import { SetStateAction } from "react";

export function guardDispatch<A>(f: SetStateAction<A>) {
  return (a: A) => {
    const b = f instanceof Function ? f(a) : f;
    if (hash(a) === hash(b)) return a;
    return b;
  };
}
