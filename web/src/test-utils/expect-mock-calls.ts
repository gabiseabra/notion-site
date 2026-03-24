import type { MatcherFunction } from "expect";
import { act } from "react";

const toBeCalledDuring: MatcherFunction<[fn: () => void, expected: unknown[]]> =
  function (actual, fn, expected) {
    if (typeof actual !== "function" || !("mock" in (actual as object))) {
      throw new TypeError("toBeCalledDuring expects a mock function");
    }

    const mock = actual as jest.Mock;
    const before = mock.mock.calls.length;

    act(fn);

    const received = mock.mock.calls.slice(before).map((call) => call[0]);
    const pass = this.equals(received, expected);

    return {
      pass,
      message: () =>
        pass
          ? `expected mock not to have been called with ${this.utils.printExpected(expected)} during action`
          : `expected mock to have been called in order:\n${this.utils.diff(expected, received)}`,
    };
  };

export const expectMockCalls = { toBeCalledDuring };

declare global {
  namespace jest {
    interface AsymmetricMatchers {
      toBeCalledDuring(fn: () => void, expected: unknown[]): void;
    }

    interface Matchers<R> {
      toBeCalledDuring(fn: () => void, expected: unknown[]): R;
    }
  }
}
