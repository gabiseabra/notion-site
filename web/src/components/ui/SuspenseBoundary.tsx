import React, { ReactNode } from "react";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Col } from "../block/FlexBox.js";
import { Spinner } from "../inline/Spinner.js";
import { Banner } from "../block/Banner.js";
import { Span } from "../inline/Text.js";

type ErrorFallback = ReactNode | ((error: unknown) => ReactNode);

export type SuspenseBoundaryProps = {
  children: ReactNode;
  /**
   * Size of the spinner / error banner.
   * @note use `s` for inline elements, `m` for block elements, and `l` for top-level page elements
   */
  size: "s" | "m" | "l";
  /**
   * Name of the resource being loaded.
   * @note used for enhancing the feedback elements in large size.
   */
  resourceName: string;
  onError?: (error: unknown) => void;
};

/**
 * Combines an error boundary with React Suspense.
 *
 * Children may suspend by throwing a Promise and may fail by throwing an error.
 */
export function SuspenseBoundary({
  children,
  size,
  resourceName,
  onError,
}: SuspenseBoundaryProps) {
  const alignY = size === "s" ? "baseline" : "center";
  const alignX = size === "l" ? "center" : undefined;
  const flex = size === "l" ? 1 : undefined;

  return (
    <Boundary
      fallback={(error) => (
        <Col alignX={alignX} alignY={alignY} style={{ flex }}>
          <Banner
            type="error"
            size={size}
            title={
              size === "l"
                ? `There was an error loading ${resourceName}`
                : undefined
            }
          >
            {extractErrorMessage(error)}
          </Banner>
        </Col>
      )}
      onError={onError}
    >
      <React.Suspense
        fallback={
          <Col
            alignX={alignX}
            alignY={alignY}
            style={{ flex, display: "inline-flex" }}
          >
            <Col alignX="center" gap={4}>
              <Spinner size={size} />

              {size === "l" && (
                <Span
                  color="muted"
                  size="caption"
                >{`Loading ${resourceName}`}</Span>
              )}
            </Col>
          </Col>
        }
      >
        {children}
      </React.Suspense>
    </Boundary>
  );
}

type BoundaryState = { error: unknown | null };

class Boundary extends React.Component<
  {
    fallback: ErrorFallback;
    onError?: (error: unknown) => void;
    children: ReactNode;
  },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      return typeof fallback === "function"
        ? (fallback as (e: unknown) => ReactNode)(error)
        : fallback;
    }

    return children;
  }
}
