/**
 * Responsive helpers for conditional rendering by breakpoint.
 *
 * @example
 * <Breakpoint.Switch>
 *   <Breakpoint.UpTo size="m">Small or medium</Breakpoint.UpTo>
 *   <Breakpoint.Else>Large</Breakpoint.Else>
 * </Breakpoint.Switch>
 */
import { ComponentProps, ReactElement, ReactNode, useMemo } from "react";
import { match } from "ts-pattern";
import * as css from "../../css/index.js";
import { useWindowSize } from "../../hooks/useWindowSize.js";

type Breakpoint = "s" | "m" | "l";

type BreakpointProps = {
  size: Breakpoint;
  children: ReactNode;
};

/**
 * Render children only when the current breakpoint matches `size`.
 */ function BreakpointOnly({ size, children }: BreakpointProps) {
  const bp = useBreakpoint();

  return bp && Breakpoint.compare(bp, size) == 0 ? children : null;
}

/**
 * Render children when the current breakpoint is up to (<=) `size`.
 */
function BreakpointUpTo({ size, children }: BreakpointProps) {
  const bp = useBreakpoint();

  return bp && Breakpoint.compare(bp, size) <= 0 ? children : null;
}

/**
 * Fallback branch for Breakpoint.Switch.
 */
function BreakpointElse({ children }: { children: ReactNode }) {
  return children;
}

/**
 * Render the first matching breakpoint branch.
 */
function BreakpointSwitch({
  children,
}: {
  children: (
    | ReactElement<ComponentProps<typeof BreakpointOnly>, typeof BreakpointOnly>
    | ReactElement<ComponentProps<typeof BreakpointUpTo>, typeof BreakpointUpTo>
    | ReactElement<ComponentProps<typeof BreakpointElse>, typeof BreakpointElse>
    | null
    | undefined
    | false
  )[];
}) {
  const bp = useBreakpoint();

  return (
    children.find((node) =>
      match(node)
        .with(
          { type: BreakpointOnly },
          ({ props }) =>
            bp && "size" in props && Breakpoint.compare(bp, props.size) === 0,
        )
        .with(
          { type: BreakpointUpTo },
          ({ props }) =>
            bp && "size" in props && Breakpoint.compare(bp, props.size) <= 0,
        )
        .with({ type: BreakpointElse }, () => true)
        .otherwise(() => false),
    ) ?? null
  );
}

/**
 * Determine the current breakpoint from window width.
 */
function useBreakpoint() {
  const { width } = useWindowSize();
  const bp = useMemo(
    () => ({
      s: css.toPx(css.computeProperty(css.breakpoint("s"))),
      m: css.toPx(css.computeProperty(css.breakpoint("m"))),
    }),
    [],
  );

  if (!width) return null;
  if (width <= bp.s) return "s";
  if (width <= bp.m) return "m";
  return "l";
}

export const Breakpoint = {
  /**
   * Compare two breakpoints with s < m < l ordering.
   */
  compare(a: Breakpoint, b: Breakpoint): 1 | 0 | -1 {
    const order = ["s", "m", "l"] as const;
    const diff = order.indexOf(a) - order.indexOf(b);
    if (diff === 0) return 0;
    return diff > 0 ? 1 : -1;
  },

  Only: BreakpointOnly,

  UpTo: BreakpointUpTo,

  Else: BreakpointElse,

  Switch: BreakpointSwitch,
};
