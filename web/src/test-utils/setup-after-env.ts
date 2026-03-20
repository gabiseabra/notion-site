import { showError } from "@notion-site/common/utils/error.js";
import { expectSelectionRange } from "./expect-visual-selection.js";

expect.extend({
  ...expectSelectionRange,
});

const failOnCall =
  (method: string) =>
  (...args: unknown[]) => {
    throw new Error(`console.${method} called: ${showError(args)}`);
  };

console.log = failOnCall("log");
console.warn = failOnCall("warn");
