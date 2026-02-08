import { useEffect, useState } from "react";

type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window === "undefined" ? undefined : window.innerWidth,
    height: typeof window === "undefined" ? undefined : window.innerHeight,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
