import React, { ReactNode } from "react";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Col } from "../block/FlexBox.js";
import { Spinner } from "../inline/Spinner.js";
import { Banner } from "../block/Banner.js";
import { Span } from "../inline/Text.js";

export type SuspenseBoundaryProps = {
  children: ReactNode;
  loading: ReactNode;
  error: (error: unknown) => ReactNode;
  onError?: (error: unknown) => void;
};

/**
 * Combines an error boundary with React Suspense.
 * Children may suspend by throwing a Promise and may fail by throwing an error.
 */
export function SuspenseBoundary({
  children,
  loading,
  error,
  onError,
}: SuspenseBoundaryProps) {
  return (
    <Boundary fallback={error} onError={onError}>
      <React.Suspense fallback={loading}>{children}</React.Suspense>
    </Boundary>
  );
}

export type PageSuspenseBoundaryProps = {
  children: ReactNode;
  /**
   * Name of the resource being loaded.
   */
  resourceName: string;
  onError?: (error: unknown) => void;
};

/**
 * Suspense and error boundary for loading pages with normalized feedback indicators.
 * @direction block
 */
export function PageSuspenseBoundary({
  resourceName,
  ...props
}: PageSuspenseBoundaryProps) {
  return (
    <SuspenseBoundary
      {...props}
      loading={
        <Col flex={1} alignX="center" alignY="center" gap={4}>
          <Spinner size="l" />

          <Span color="muted" size="caption">{`Loading ${resourceName}`}</Span>
        </Col>
      }
      error={(error) => (
        <Col flex={1} alignX="center" alignY="center" gap={4}>
          <Banner
            type="error"
            size="l"
            title={`There was an error loading ${resourceName}`}
          >
            {extractErrorMessage(error)}
          </Banner>
        </Col>
      )}
    />
  );
}

/** Utilities */

type BoundaryState = { error: unknown | null };

class Boundary extends React.Component<
  {
    fallback: (error: unknown) => ReactNode;
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
      return fallback(error);
    }

    return children;
  }
}
