import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useWindowEventListener } from "../../hooks/use-window-event-listener.js";

export type GalleryDirection = "left" | "right" | "up" | "down";

type GalleryContextValue = {
  current: string | null;
  register: (id: string, element: HTMLImageElement) => () => void;
  open: (id: string) => void;
  close: () => void;
  next: (id: string, direction: GalleryDirection) => string | null;
  move: (direction: GalleryDirection) => void;
};

type Item = { id: string; rect: DOMRect };

const GalleryContext = createContext<GalleryContextValue | null>(null);

const directions: Partial<Record<string, GalleryDirection>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export function useGallery() {
  return useContext(GalleryContext);
}

export function GalleryProvider({ children }: { children: ReactNode }) {
  const images = useRef(new Map<string, HTMLImageElement>());
  const [current, setCurrent] = useState<string | null>(null);

  const register = useCallback((id: string, element: HTMLImageElement) => {
    images.current.set(id, element);
    return () => {
      if (images.current.get(id) === element) images.current.delete(id);
      setCurrent((current) => (current === id ? null : current));
    };
  }, []);

  const next = useCallback((id: string, direction: GalleryDirection) => {
    const items = Array.from(images.current, ([id, element]) => ({
      id,
      rect: element.getBoundingClientRect(),
    })).filter(({ rect }) => rect.width > 0 && rect.height > 0);

    return nextItem(id, items, direction);
  }, []);

  const move = useCallback(
    (direction: GalleryDirection) =>
      setCurrent((current) =>
        current ? (next(current, direction) ?? current) : current,
      ),
    [next],
  );

  useWindowEventListener("keydown", (event) => {
    const direction = current && directions[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  });

  return (
    <GalleryContext.Provider
      value={{
        current,
        register,
        open: setCurrent,
        close: () => setCurrent(null),
        next,
        move,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

function nextItem(id: string, items: Item[], direction: GalleryDirection) {
  const current = items.find((item) => item.id === id);
  if (!current) return null;

  const rest = items.filter((item) => item !== current);
  const cx = (rect: DOMRect) => rect.left + rect.width / 2;
  const cy = (rect: DOMRect) => rect.top + rect.height / 2;
  const overlapsX = (rect: DOMRect) =>
    current.rect.left < rect.right && rect.left < current.rect.right;
  const overlapsY = (rect: DOMRect) =>
    current.rect.top < rect.bottom && rect.top < current.rect.bottom;

  if (direction === "right") {
    return (
      rest
        .filter(({ rect }) => cx(rect) > cx(current.rect) && overlapsY(rect))
        .sort(
          (a, b) =>
            cx(a.rect) - cx(current.rect) - (cx(b.rect) - cx(current.rect)),
        )[0]?.id ??
      rest
        .filter(({ rect }) => cy(rect) > cy(current.rect))
        .sort(
          (a, b) =>
            a.rect.top * 10000 +
            a.rect.left -
            (b.rect.top * 10000 + b.rect.left),
        )[0]?.id ??
      null
    );
  }

  if (direction === "left") {
    return (
      rest
        .filter(({ rect }) => cx(rect) < cx(current.rect) && overlapsY(rect))
        .sort(
          (a, b) =>
            cx(current.rect) - cx(a.rect) - (cx(current.rect) - cx(b.rect)),
        )[0]?.id ??
      rest
        .filter(({ rect }) => cy(rect) < cy(current.rect))
        .sort(
          (a, b) =>
            b.rect.top * 10000 +
            b.rect.left -
            (a.rect.top * 10000 + a.rect.left),
        )[0]?.id ??
      null
    );
  }

  return (
    rest
      .filter(({ rect }) =>
        direction === "down"
          ? cy(rect) > cy(current.rect)
          : cy(rect) < cy(current.rect),
      )
      .sort(
        (a, b) =>
          (overlapsX(a.rect) ? 0 : 1000000) +
          Math.abs(cy(a.rect) - cy(current.rect)) * 1000 +
          Math.abs(cx(a.rect) - cx(current.rect)) -
          ((overlapsX(b.rect) ? 0 : 1000000) +
            Math.abs(cy(b.rect) - cy(current.rect)) * 1000 +
            Math.abs(cx(b.rect) - cx(current.rect))),
      )[0]?.id ?? null
  );
}
