import type { MatcherFunction } from "expect";
import { SelectionRange } from "../utils/selection-range.js";

/** @internal */
export function renderSelectionRange(
  text: string,
  selection: SelectionRange,
): string {
  const start = selection.start;
  const end = selection.end;

  if (SelectionRange.isCollapsed(selection)) {
    return `${text.slice(0, start)}|${text.slice(start)}`;
  }

  return `${text.slice(0, start)}[${text.slice(start, end)}]${text.slice(end)}`;
}

/** @internal */
export function parseSelectionRange(input: string): {
  text: string;
  selection: SelectionRange;
} {
  const caret = input.indexOf("|");
  if (caret !== -1) {
    return {
      text: input.slice(0, caret) + input.slice(caret + 1),
      selection: { start: caret, end: caret },
    };
  }

  const open = input.indexOf("[");
  const close = input.indexOf("]");
  if (open !== -1 && close !== -1 && close > open) {
    return {
      text:
        input.slice(0, open) +
        input.slice(open + 1, close) +
        input.slice(close + 1),
      selection: { start: open, end: close - 1 },
    };
  }

  throw new Error(`Invalid visual selection string: ${input}`);
}

const toMatchVisualSelection: MatcherFunction<[expected: string]> = function (
  actual,
  expected,
) {
  if (
    typeof actual !== "object" ||
    actual === null ||
    !("text" in actual) ||
    !("selection" in actual)
  ) {
    throw new TypeError(
      "toRenderSelectionAs expects { text: string; selection: SelectionRange }",
    );
  }

  const candidate = actual as {
    text: string;
    selection: SelectionRange;
  };

  if (typeof candidate.text !== "string") {
    throw new TypeError("toRenderSelectionAs expects text to be a string");
  }

  const rendered = renderSelectionRange(candidate.text, candidate.selection);
  const pass = rendered === expected;

  return {
    pass,
    message: () =>
      pass
        ? `expected ${this.utils.printReceived(rendered)} not to equal ${this.utils.printExpected(expected)}`
        : `expected ${this.utils.printReceived(rendered)} to equal ${this.utils.printExpected(expected)}`,
  };
};

export const expectSelectionRange = {
  toMatchVisualSelection,
};

declare module "expect" {
  interface AsymmetricMatchers {
    toMatchVisualSelection(expected: string): void;
  }

  interface Matchers<R> {
    toMatchVisualSelection(expected: string): R;
  }
}
