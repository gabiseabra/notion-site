import {
  createContext,
  ReactNode,
  useContext,
  useId,
  useRef,
  useState,
} from "react";

const HeadContext = createContext<{
  register: (id: string) => void;
  last: string;
} | null>(null);

export function HeadProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);

  const register = (id: string) => {
    setStack((s) => [...s.filter((x) => x !== id), id]);
  };

  const last = stack[stack.length - 1];

  return (
    <HeadContext.Provider value={{ register, last }}>
      {children}
    </HeadContext.Provider>
  );
}

/**
 * Renders head-related elements only if this instance is the most
 * recently mounted `<Head />` within a `HeadProvider`.
 *
 * Earlier `<Head />` instances remain mounted but do not render,
 * ensuring a single effective head definition at any time.
 */
export function Head({ children }: { children: ReactNode }) {
  const ctx = useContext(HeadContext)!;
  const hasRegistered = useRef(false);
  const id = useId();

  if (!hasRegistered.current) {
    ctx.register(id);
    hasRegistered.current = true;
  }

  if (ctx.last !== id) return null;

  return <>{children}</>;
}
