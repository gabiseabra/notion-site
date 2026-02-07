# Test Style Guide

## Document Before Testing

When adding tests for a function that lacks documentation, write JSDoc first. Tests should verify documented behavior,
not serve only as a demonstration.

```ts
/**
 * Compute the caret position when navigating vertically between block elements.
 *
 * @param currentElement - The element containing the current selection
 * @param targetElement - The element to navigate to
 * @param direction - "up" or "down"
 * @returns Selection with caret position, or null if not on boundary line
 */
export function getVerticalNavigationRange(/* ... */) {
}
```

## Be Declarative

Don't declare variables you only use once. Inline the call in the assertion.

```ts
// Bad
const result = getVerticalNavigationRange(current, target, "down");
expect(result).toEqual({ start: 0, end: null });

// Good
expect(getVerticalNavigationRange(current, target, "down")).toEqual({
  start: 0,
  end: null,
});
```

## Use Appropriate Rendering

For utility functions that operate on DOM elements, simple JSX suffices:

```tsx
const { container } = render(
  <div>
    <p tabIndex={0}>hello</p>
    <p tabIndex={0}></p>
  </div>,
);
const [first, second] = Array.from(container.querySelectorAll("p"));
```

For testing plugin behavior or component integration, use `ContentEditor` with mock blocks:

```tsx
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { ContentEditor } from "../ContentEditor.js";

const blocks = [p("a", span("First")), p("b", span("Second"))];
const { container } = render(<ContentEditor value={blocks} onChange={() => {
}} />);
```

## Test Names

Use "it [does something]" format that reads as a sentence:

```ts
it("returns range when navigating down between two empty elements", () => {
```
