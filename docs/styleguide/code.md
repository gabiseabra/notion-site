# Code Style Guide

## Check the Real Condition, Not a Proxy

```ts
// Bad: sloppy AI code trying to get caret left position in such a way that fixes
// being unable to navigate to an empty empty block.
let caretLeft: number;
if (currentElement.textContent === "") {
  caretLeft = currentElement.getBoundingClientRect().left;
} else {
  if (!sel?.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const caretRect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  caretLeft = caretRect.left;
}
```

This code checks `textContent === ""` but that's not the real issue. The real issue is that `sel` has no range when the
element is empty. By checking a proxy condition instead of the real one, you end up with two parallel branches: one
handling the proxy case, another handling `sel` as if it's always present.

Check the real condition instead and make proper use of narrowing:

```ts
// Good
if (!sel) return null;
const caretLeft = (() => {
  if (sel.rangeCount === 0) return currentElement.getBoundingClientRect().left;
  const range = sel.getRangeAt(0);
  return range.getClientRects()[0] ?? range.getBoundingClientRect();
})();

```

## Avoid `let` with Conditional Assignment

Don't define a variable with `let` and assign it in different branches. Either use an IIFE or extract to a helper
function.
This constraint helps expose complexity. If you find yourself needing multiple conditionals or a long branches, that's a
signal the logic should be extracted into its own function.

```ts

// Good - IIFE for simple cases
const selection =
  (() => {
    const element = editor.ref(block.id);
    return element && getSelectionRange(element);
  })() ?? undefined;

// Good - extract to helper for complex cases
const caretLeft = getCaretLeft(element, direction);
```

## Document Functions

When writing utility modules, add a short jsdoc explaining what the function is doing if it isn't trivial.
If the function is being exported, be more descriptive and add **`@note`** s about behaviour and edge cases.

- **You don't need to use `@internal`**: Internal helpers are not exported. Just write a one line explanation, it's
  fine!
- **You don't need to use `@params`**: Params should already be clear by the type annotations.
- **You can use `@return`** to explain how to explain the return type.

```ts
// Internal helper - one line
/** Get caret's x position, or null if not on the boundary line for the given direction. */
function getCaretLeft(element: HTMLElement, direction: "up" | "down"): number | null {
}

// Exported function - full JSDoc
/**
 * Compute the caret position when navigating vertically between block elements.
 *
 * @returns Selection with caret position in target element, or null if:
 *   - No selection exists
 *   - Selection is not collapsed (has a range)
 *   - Caret is not on the boundary line (first line for "up", last line for "down")
 */
export function getVerticalNavigationRange(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: "up" | "down",
): Selection | null {
}
```

## Pattern: Flat Functions

This is a pattern that works well in some cases:

1. Gather variables
2. Do one conditional check
3. Return or continue

Use cases:

- **Helper functions:** This works well for helper functions exist to avoid too much complexity in one place. Since they
  already isolate complex logic, it makes sense to break that logic down further into comprehensible steps.
- **Loops and switch-case:** This avoids over-complicating already complex cases: loops, switches, if/else chains, match
  branches... these are already complex, adding more branches inside creates cognitive overhead for the reviewer.

 ```ts
switch (e.key) {
  case "ArrowUp": {
    if (!prevElement) return;
    const range = getVerticalNavigationRange(
      e.currentTarget,
      prevElement,
      "up",
    );
    if (!range) return;

    prevElement.focus();
    setSelectionRange(prevElement, range);

    e.preventDefault();
    e.stopPropagation();

    return;
  }
  // . . . more cases
}

```