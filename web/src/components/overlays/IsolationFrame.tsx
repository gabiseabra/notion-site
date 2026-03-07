import {
  CSSProperties,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMutationObserver } from "../../hooks/use-mutation-observer.js";
import { useRafThrottledCallback } from "../../hooks/use-raf-throttled-callback.js";
import { useResizeObserver } from "../../hooks/use-resize-observer.js";
import styles from "./IsolationFrame.module.scss";

type IsolationFrameProps = {
  ref?: Ref<{ iframe: HTMLIFrameElement | null }>;
  children: ReactNode;
  style?: CSSProperties;
  resize?: true | "y" | "x";
};

const CLONED_STYLE_ATTR = "data-isolation-frame-style";

/**
 * Renders children into an iframe.
 * Styles from the main document are copied over to the iframe, and the height
 * is adjusted to the content's max height.
 * This is useful to render content that you can interact without interfering
 * with the selection state of the outer document.
 */
export function IsolationFrame({
  ref,
  children,
  style,
  resize,
}: IsolationFrameProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const headRef = useRef<HTMLElement | null>(null);

  headRef.current = typeof document === "undefined" ? null : document.head;

  useImperativeHandle(
    ref,
    () => ({
      get iframe() {
        return iframeRef.current;
      },
    }),
    [ref],
  );

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

  useResizeObserver(
    {
      get current() {
        return iframeRef.current?.contentDocument?.body ?? null;
      },
    },
    () => {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      const body = doc?.body;

      if (!resize || !iframe || !doc || !body) return;

      if (resize === true || resize === "y")
        iframe.style.height = `${body.offsetHeight}px`;
      if (resize === true || resize === "x")
        iframe.style.width = `${body.offsetWidth}px`;
    },
  );

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
