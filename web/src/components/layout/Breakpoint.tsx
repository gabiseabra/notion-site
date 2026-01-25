import { ComponentProps, ReactElement, ReactNode, useMemo } from "react";
import { match } from "ts-pattern";
import * as css from "../../css/index.js";
import { useWindowSize } from "../../hooks/useWindowSize.js";

type Breakpoint = "s" | "m" | "l";

type BreakpointProps = {
  size: Breakpoint;
  children: ReactNode;
};

function BreakpointOnly({ size, children }: BreakpointProps) {
  const bp = useBreakpoint();

  return bp && Breakpoint.compare(bp, size) == 0 ? children : null;
}

function BreakpointUpTo({ size, children }: BreakpointProps) {
  const bp = useBreakpoint();

  return bp && Breakpoint.compare(bp, size) <= 0 ? children : null;
}

function BreakpointElse({ children }: { children: ReactNode }) {
  return children;
}

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
