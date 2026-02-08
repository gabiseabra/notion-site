import { expectSelectionRange } from "./expect-visual-selection.js";

expect.extend({
  ...expectSelectionRange,
});
