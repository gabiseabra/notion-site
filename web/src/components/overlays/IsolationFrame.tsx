import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./IsolationFrame.module.scss";

type IsolationFrameProps = {
  children: ReactNode;
};

/**
 * Renders children into an iframe.
 * Styles from the main document are copied over to the iframe, and the height
 * is adjusted to the content's max height.
 * This is useful to render content that you can interact without interfering
 * with the selection state of the outer document.
 */
export function IsolationFrame({ children }: IsolationFrameProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    const body = doc?.body;

    if (!doc || !body) return;

    doc.documentElement.className = styles.html;

    for (const style of Array.from(document.head.querySelectorAll("style"))) {
      const cloned = style.cloneNode(true);
      if (cloned instanceof HTMLStyleElement) {
        doc.head.appendChild(cloned);
      }
    }

    setRoot(body);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const body = doc?.body;

    if (!iframe || !doc || !body) return;

    const resize = () => {
      iframe.style.height = `${body.offsetHeight}px`;
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(body);

    return () => ro.disconnect();
  }, [root]);

  return (
    <iframe ref={iframeRef} className={styles.frame} style={{ height: 0 }}>
      {root ? createPortal(children, root) : null}
    </iframe>
  );
}
