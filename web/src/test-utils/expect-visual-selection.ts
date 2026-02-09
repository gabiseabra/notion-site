import { never } from "@notion-site/common/utils/error.js";
import type { MatcherFunction } from "expect";
import z from "zod";
import { SelectionRange } from "../utils/selection-range.js";

const toMatchVisualSelection: MatcherFunction<[expected: string]> = function (
  actual,
  expected,
) {
  const candidate = parseMatcherInput(actual);
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

declare global {
  namespace jest {
    interface AsymmetricMatchers {
      toMatchVisualSelection(expected: string): void;
    }

    interface Matchers<R> {
      toMatchVisualSelection(expected: string): R;
    }
  }
}

/** Internals */

function renderSelectionRange(text: string, selection: SelectionRange): string {
  const start = selection.start;
  const end = selection.end;

  if (SelectionRange.isCollapsed(selection)) {
    return `${text.slice(0, start)}|${text.slice(start)}`;
  }

  return `${text.slice(0, start)}[${text.slice(start, end)}]${text.slice(end)}`;
}

function parseMatcherInput(actual: unknown) {
  if (actual instanceof HTMLElement) {
    return {
      text: actual.textContent ?? "",
      selection:
        SelectionRange.read(actual) ??
        never("Expected element to have selection"),
    };
  }

  const parseResult = z
    .object({
      text: z.string(),
      selection: z.object({ start: z.number(), end: z.number() }),
    })
    .safeParse(actual);

  if (parseResult.success) {
    return parseResult.data;
  }

  throw new TypeError(
    "toRenderSelectionAs expects HTMLElement | { text: string; selection: SelectionRange }",
  );
}
