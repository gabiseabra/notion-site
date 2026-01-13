import React, { ReactNode } from "react";
import { Col } from "../block/FlexBox.js";
import { Spinner } from "../inline/Spinner.js";
import { Banner } from "../block/Banner.js";
import { extractErrorMessage } from "../../utils/error.js";

type ErrorFallback = ReactNode | ((error: unknown) => ReactNode);

export type SuspenseBoundaryProps = {
  children: ReactNode;
  loading?: ReactNode;
  error?: ErrorFallback;
  onError?: (error: unknown) => void;
};

/**
 * Combines an error boundary with React Suspense.
 *
 * Children may suspend by throwing a Promise and may fail by throwing an error.
 */
export function SuspenseBoundary({
  children,
  loading = (
    <Col alignX="center" alignY="center" style={{ flex: 1, height: "100%" }}>
      <Spinner size="m" />
    </Col>
  ),
  error = (error) => (
    <Col alignX="center">
      <Banner type="error">{extractErrorMessage(error)}</Banner>
    </Col>
  ),
  onError,
}: SuspenseBoundaryProps) {
  return (
    <Boundary fallback={error} onError={onError}>
      <React.Suspense fallback={loading}>{children}</React.Suspense>
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
