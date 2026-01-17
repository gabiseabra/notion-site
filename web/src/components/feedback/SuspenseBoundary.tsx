import React, { ReactNode, useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import { extractErrorMessage } from "@notion-site/common/utils/error.js";
import { Col } from "../layout/FlexBox.js";
import { Banner } from "./Banner.js";
import { SimlishSpinner } from "./SimlishSpinner.js";
import { Button } from "../form/Button.js";

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
  onRetry?: () => void;
  onError?: (error: unknown) => void;
};

/**
 * Suspense and error boundary for loading pages with normalized feedback indicators.
 * @direction block
 */
export function PageSuspenseBoundary({
  resourceName,
  onRetry,
  ...props
}: PageSuspenseBoundaryProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <SuspenseBoundary
      key={retryKey}
      {...props}
      loading={
        <Col flex={1} alignX="center" alignY="center">
          <SimlishSpinner resourceName={resourceName} />
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

            {onRetry && (
              <Button
                color="red"
                variant="plain"
                icon={<FaArrowsRotate />}
                onClick={() => {
                  setRetryKey((k) => k + 1);
                  onRetry();
                }}
              >
                Retry
              </Button>
            )}
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
