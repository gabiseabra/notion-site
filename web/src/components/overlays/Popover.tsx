import { hash } from "@notion-site/common/utils/hash.js";
import React, {
  CSSProperties,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as css from "../../css/index.js";
import { useDocumentEventListener } from "../../hooks/use-document-event-listener.js";
import { useRafThrottledCallback } from "../../hooks/use-raf-throttled-callback.js";
import { useResizeObserver } from "../../hooks/use-resize-observer.js";
import { useWindowEventListener } from "../../hooks/use-window-event-listener.js";
import { isEventFromElement } from "../../utils/event.js";
import styles from "./Popover.module.scss";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export type PopoverProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  open: boolean;
  role?: "tooltip" | "popover";

  placements?: PopoverPlacement[]; // preferred order
  offset?: number; // space unit

  className?: string;
  style?: {
    wrap?: CSSProperties;
    container?: CSSProperties;
  };

  onClickOutside?: () => void;
  onOffScreen?: () => void;
  onClose?: () => void;
};

type Coords = {
  placement: PopoverPlacement;
  top: number;
  left: number;
  arrowLeft?: number;
  arrowTop?: number;
  arrowRight?: number;
  arrowBottom?: number;
};

export function Popover({
  children,
  content,
  open,
  role = "popover",

  placements = ["top", "bottom", "right", "left"],
  offset = 2,

  className = "",
  style,

  onClickOutside,
  onOffScreen,
  onClose,
}: PopoverProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const [coords, setCoords] = useState<Coords | null>(null);
  const id = useId();
  const tooltipId = useMemo(() => `tooltip-${id}`, [id]);

  const arrowStyle = useMemo(() => {
    if (!coords) return undefined;

    const base = coords.placement.split("-")[0];

    if (base === "top" || base === "bottom") {
      if (coords.arrowLeft != null) {
        return {
          left: coords.arrowLeft,
          marginLeft: 0,
          transform: "translateX(-50%) rotate(45deg)",
        };
      }
      if (coords.arrowRight != null) {
        return {
          left: "auto",
          right: coords.arrowRight,
          marginLeft: 0,
          transform: "translateX(50%) rotate(45deg)",
        };
      }
      return undefined; // centered: CSS left: 50% handles it
    }

    if (base === "left" || base === "right") {
      if (coords.arrowTop != null) {
        return {
          top: coords.arrowTop,
          marginTop: 0,
          transform: "translateY(-50%) rotate(45deg)",
        };
      }
      if (coords.arrowBottom != null) {
        return {
          top: "auto",
          bottom: coords.arrowBottom,
          marginTop: 0,
          transform: "translateY(50%) rotate(45deg)",
        };
      }
      return undefined; // centered: CSS top: 50% handles it
    }

    return undefined;
  }, [coords]);

  const onOffScreenRef = useRef(() => {});
  onOffScreenRef.current = () => {
    onOffScreen?.();
    onClose?.();
  };

  const updatePosition = useRafThrottledCallback(() => {
    const triggerEl = triggerRef.current;
    const tipEl = tipRef.current;
    if (!triggerEl || !tipEl) return;

    const triggerRect = getTriggerRect(triggerEl);
    const coords = getBestCoords(
      css.toPx(css.computeProperty(css._space)) * offset,
      css.toPx(css.computeProperty(css._space)) * 2,
      css.toPx(css.computeProperty(css._space)) * 2,
      placements,
      triggerRect,
      tipEl.getBoundingClientRect(),
    );

    // If we are inside a transformed popover, fixed positioning becomes relative
    // to that ancestor. Convert viewport coords into that local space so nested
    // popovers (e.g. floating toolbar menus) stay aligned.
    if (coords) {
      const fixedParent = triggerEl.closest(`.${styles.popover}`);
      if (fixedParent instanceof HTMLElement) {
        const transform = getComputedStyle(fixedParent).transform;
        if (transform && transform !== "none") {
          const parentRect = fixedParent.getBoundingClientRect();
          coords.top -= parentRect.top;
          coords.left -= parentRect.left;
        }
      }
    }

    if (!coords) onOffScreenRef.current();

    setCoords(coords);
  }, [hash(placements), offset]);

  // Position when opening + whenever content/placements change
  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    updatePosition();
  }, [open, content, updatePosition]);

  // Reposition on scroll/resize while open
  useWindowEventListener("resize", updatePosition);
  useWindowEventListener("scroll", updatePosition);
  useResizeObserver(triggerRef, updatePosition);
  useResizeObserver(tipRef, updatePosition);

  // Handle onClickOutside
  const onClickOutsideRef = useRef(() => {});
  onClickOutsideRef.current = () => {
    onClickOutside?.();
    onClose?.();
  };

  useDocumentEventListener(
    "pointerdown",
    useCallback((e) => {
      if (triggerRef.current && !isEventFromElement(e, triggerRef.current)) {
        onClickOutsideRef.current();
      }
    }, []),
  );

  return (
    <span
      ref={triggerRef}
      className={styles.wrap}
      aria-describedby={open ? tooltipId : undefined}
      style={style?.wrap}
    >
      {children}

      {open && (
        <div
          ref={tipRef}
          id={tooltipId}
          role={role}
          className={[className, styles.popover].join(" ")}
          data-placement={coords?.placement ?? placements[0] ?? "top"}
          style={{
            top: coords?.top ?? 0,
            left: coords?.left ?? 0,
            opacity: coords ? 1 : 0,
            ...style?.container,
          }}
        >
          <div className={styles.content}>{content}</div>
          <div className={styles.arrow} aria-hidden="true" style={arrowStyle} />
        </div>
      )}
    </span>
  );
}

function getTriggerRect(triggerEl: HTMLElement): DOMRect {
  const rect = triggerEl.getBoundingClientRect();
  if (rect.width || rect.height) return rect;

  const child = triggerEl.firstElementChild;
  return child instanceof HTMLElement ? child.getBoundingClientRect() : rect;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Vibecoded with ChatGPT. Don't ask how it works.
 */
function getBestCoords(
  offset: number,
  arrowGutter: number,
  viewportPad: number,
  placements: PopoverPlacement[],
  trigger: DOMRect,
  tip: DOMRect,
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // If the trigger is fully off-screen, don't try to position the popover.
  const isOffscreen =
    trigger.bottom < 0 ||
    trigger.top > vh ||
    trigger.right < 0 ||
    trigger.left > vw;

  if (isOffscreen) return null;

  const cx = trigger.left + trigger.width / 2;
  const cy = trigger.top + trigger.height / 2;

  const clampLeftInViewport = (left: number) => {
    const maxLeft = Math.max(viewportPad, vw - tip.width - viewportPad);
    return clamp(left, viewportPad, maxLeft);
  };

  const clampTopInViewport = (top: number) => {
    const maxTop = Math.max(viewportPad, vh - tip.height - viewportPad);
    return clamp(top, viewportPad, maxTop);
  };

  let best: { top: number; left: number; placement: PopoverPlacement } | null =
    null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const placement of placements) {
    const base = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
    const align = placement.split("-")[1] as "start" | "end" | undefined;

    let top: number;
    let left: number;

    if (base === "top" || base === "bottom") {
      top =
        base === "top"
          ? trigger.top - tip.height - offset
          : trigger.bottom + offset;

      left = cx - tip.width / 2;
      if (align === "start") left = trigger.left;
      if (align === "end") left = trigger.right - tip.width;

      // slide horizontally BEFORE scoring (respect padding)
      left = clampLeftInViewport(left);
    } else {
      left =
        base === "left"
          ? trigger.left - tip.width - offset
          : trigger.right + offset;

      top = cy - tip.height / 2;
      if (align === "start") top = trigger.top;
      if (align === "end") top = trigger.bottom - tip.height;

      // slide vertically BEFORE scoring (respect padding)
      top = clampTopInViewport(top);
    }

    // score overflow against padded viewport
    const overLeft = Math.max(0, viewportPad - left);
    const overTop = Math.max(0, viewportPad - top);
    const overRight = Math.max(0, left + tip.width - (vw - viewportPad));
    const overBottom = Math.max(0, top + tip.height - (vh - viewportPad));

    const score = overLeft + overTop + overRight + overBottom;

    if (score < bestScore) {
      bestScore = score;
      best = { top, left, placement };
      if (score === 0) break; // keep preferred order when it fits
    }
  }

  if (!best) return null;

  // final safety clamp (also respects padding)
  const top = clampTopInViewport(best.top);
  const left = clampLeftInViewport(best.left);

  const base = best.placement.split("-")[0];
  const align = best.placement.split("-")[1] as "start" | "end" | undefined;

  // Arrow positions are trigger-relative so they remain stable when content
  // width/height changes (no dependency on tip.width / tip.height).
  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;
  let arrowRight: number | undefined;
  let arrowBottom: number | undefined;

  if (base === "top" || base === "bottom") {
    if (align === "start") arrowLeft = cx - trigger.left;
    else if (align === "end") arrowRight = trigger.right - cx;
    // centered: leave undefined — CSS `left: 50%` handles it
  } else {
    if (align === "start") arrowTop = cy - trigger.top;
    else if (align === "end") arrowBottom = trigger.bottom - cy;
    // centered: leave undefined — CSS `top: 50%` handles it
  }

  return {
    placement: best.placement,
    top: base === "top" ? top + tip.height : top,
    left:
      base === "left" ? left + tip.width :
      (base === "top" || base === "bottom") && align === "end" ? left + tip.width :
      (base === "top" || base === "bottom") && !align ? left + tip.width / 2 :
      left,
    arrowLeft,
    arrowTop,
    arrowRight,
    arrowBottom,
  };
}
