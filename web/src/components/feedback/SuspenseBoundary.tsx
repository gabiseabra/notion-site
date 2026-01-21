import { shuffle } from "@notion-site/common/utils/array.js";
import {
  extractErrorMessage,
  isErrorRecoverable,
} from "@notion-site/common/utils/error.js";
import React, { ReactNode, useMemo, useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import { Button } from "../form/Button.js";
import { Col } from "../layout/FlexBox.js";
import { IconButton } from "../typography/IconButton.js";
import { Text } from "../typography/Text.js";
import { SimlishSpinner } from "./SimlishSpinner.js";

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
  const errorKaomoji = useMemo(
    () =>
      shuffle([
        "∘ ∘ ∘ ( °ヮ° ) ?",
        "(╥﹏╥)",
        "｡°(°.◜ᯅ◝°)°｡",
        "(｡ᵕ ◞ _◟)",
        "( ‘• ω • `)",
        "(ง ͠ಥ_ಥ)ง",
        "ᕦ(˵ಥ_ಥ)ᕤ",
        "⁽⁽(੭ꐦ •̀Д•́ )੭*⁾⁾",
        "(๑•̀ㅁ•́๑)✧",
        "(๑•́o•̀๑)",
        "( ｡ •̀ ᴖ •́ ｡)",
        "(ノಠ益ಠ)ノ彡┻━┻",
        "(ಥ益ಥ)ノ彡┻━┻",
        "(｡•ˇ‸ˇ•｡)",
        "(💧́ಠ‸ಠ )",
        "(ꐦ•̀ㅁ•́) ! ! !",
        "(ಠ ʖ̯ ಠ)",
        "(ಥ﹏ಥ)ノ",
        "(ᕤಠᗣಠ)ᕤ",
        "(🤌ಠ益ಠ)🤌",
      ]).pop()!,
    [retryKey],
  );

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
        <Col flex={1} alignX="center" alignY="center">
          <div style={{ textAlign: "center" }}>
            <Text as="p" size="h1">
              {errorKaomoji}
            </Text>

            <p>&nbsp;</p>

            <Text as="h3">Damn,</Text>
            <Text as="p">{`There was an error loading ${resourceName}. It says:`}</Text>

            <Text as="p">"{extractErrorMessage(error)}"</Text>

            <p>&nbsp;</p>

            {onRetry && isErrorRecoverable(error) && (
              <Button
                color="red"
                onClick={() => {
                  setRetryKey((k) => k + 1);
                  onRetry();
                }}
              >
                <IconButton as="span" size="xs">
                  <FaArrowsRotate />
                </IconButton>
                Retry
              </Button>
            )}
          </div>
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
