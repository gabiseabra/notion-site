import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutationObserver } from "../../hooks/use-mutation-observer.js";
import { useRafThrottledCallback } from "../../hooks/use-raf-throttled-callback.js";
import styles from "./IsolationFrame.module.scss";

type IsolationFrameProps = {
  children: ReactNode;
  style?: CSSProperties;
};

const CLONED_STYLE_ATTR = "data-isolation-frame-style";

/**
 * Renders children into an iframe.
 * Styles from the main document are copied over to the iframe, and the height
 * is adjusted to the content's max height.
 * This is useful to render content that you can interact without interfering
 * with the selection state of the outer document.
 */
export function IsolationFrame({ children, style }: IsolationFrameProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const headRef = useRef<HTMLElement | null>(null);

  headRef.current = typeof document === "undefined" ? null : document.head;

  const syncStyles = useRafThrottledCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const targetHead = doc.head;
    if (!targetHead) return;

    for (const node of Array.from(
      targetHead.querySelectorAll(`[${CLONED_STYLE_ATTR}]`),
    )) {
      node.remove();
    }

    for (const node of Array.from(
      document.head.querySelectorAll('style, link[rel~="stylesheet"]'),
    )) {
      const cloned = node.cloneNode(true);
      if (cloned instanceof HTMLStyleElement) {
        cloned.setAttribute(CLONED_STYLE_ATTR, "true");
        targetHead.appendChild(cloned);
      }

      if (cloned instanceof HTMLLinkElement) {
        cloned.setAttribute(CLONED_STYLE_ATTR, "true");
        // Ensure absolute URL for iframe resolution in production.
        if (node instanceof HTMLLinkElement && node.href) {
          cloned.href = node.href;
        }
        targetHead.appendChild(cloned);
      }
    }
  }, []);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    const body = doc?.body;

    if (!doc || !body) return;

    doc.documentElement.className = styles.html;

    syncStyles();

    setRoot(body);
  }, []);

  useMutationObserver(headRef, () => syncStyles(), {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });

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
    <iframe
      ref={iframeRef}
      className={styles.frame}
      style={{ height: 0, ...style }}
    >
      {root ? createPortal(children, root) : null}
    </iframe>
  );
}
