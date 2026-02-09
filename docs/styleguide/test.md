# Test Style Guide

## Test Names

Use "it [does something]" format that reads as a sentence:

```ts
it("returns range when navigating down between two empty elements", () => {
  // ...
})
```

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
expect(result).toEqual({ start: 0, end: 0 });

// Good
expect(getVerticalNavigationRange(current, target, "down")).toEqual({
  start: 0,
  end: 0,
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

For testing plugins included in the `ContentEditor` (which uses `useNotionPluin`), use that component with mock blocks
to test the full integration:

```tsx
import { p, span } from "@notion-site/common/utils/notion/wip.js";
import { ContentEditor } from "../ContentEditor.js";

const blocks = [p("a", span("First")), p("b", span("Second"))];
const { container } = render(<ContentEditor value={blocks} />);
```

For standalone plugins like `usePlainTextPlugin` or `useLoggerPlugin`, define a minimal editor component at the top of
the test file.
Use `useEventListener` and/or forward refs to connect to editor internals **as needed** (remember: if you don't need it,
don't do it):

`@see` e.g. [use-plain-text-plugin.text.tsx](../../web/src/components/content/editable/use-plain-text-plugin.test.tsx)

## Type Narrowing in Tests

Jest assertions don't narrow types for TypeScript. It's fine to use non-null assertions in tests, but do it in sequence:

```ts
// 1. Capture non-null variable with a TypeScript assertion at assignment
const el = container.querySelector("p")!;
// 2. Assert that it is actually non-null with Jest
expect(el).toBeTruthy();
// 3. Continue to use the value as if it were non-null
expect(el.textContent).toBe("Hello");
```

## Test Behavior, Not Implementation

For pure utility functions, testing return values is fine—that *is* the behavior. But for hooks, plugins, and
components, focus on side effects and observable outcomes.
Integration tests verify observable behavior—what the system does—not internal structure. Testing return values or
internal state creates brittle tests that break on refactor even when behavior is unchanged.

Ask: "Would a user or consuming code notice if this broke?" If no, you're testing an implementation detail.

```tsx
// Bad: Testing implementation details
it("returns empty props for blocks", () => {
  const editable = useLoggerPlugin(log)(editor);
  expect(editable(block)).toEqual({});
});

// Good: Testing observable behavior through user interaction
it("logs edit events when user types in a block", () => {
  const log = jest.fn()
  const { container } = render(<TestEditor value={blocks} log={log} />);

  const el = container.querySelector("[contenteditable]")!;
  inputEvent.insert(el, "hello");

  expect(log).toHaveBeenCalledWith(expect.objectContaining({ eventType: "edit" }));
});
```

## Simulating Input on Contenteditable

`@testing-library/user-event` doesn't support contenteditable elements. Use `inputEvent` from
[`input-event.ts`](../../web/src/test-utils/input-event.ts) instead.

```ts
import { inputEvent } from "@notion-site/web/test-utils/input-event.js";

// Insert text (fires keydown, beforeinput, input per character)
inputEvent.insert(el, "hello");

// Insert line break (Shift+Enter)
inputEvent.insertLine(el);

// Delete operations (direction: -1 = backward, 1 = forward)
inputEvent.delete(el);              // Backspace
inputEvent.delete(el, 1, 1);        // Delete (forward)
inputEvent.deleteWord(el);          // Option+Backspace
inputEvent.deleteWord(el, 1, 1);    // Option+Delete
inputEvent.deleteLine(el);          // Cmd+Backspace
inputEvent.deleteLine(el, 1, 1);    // Ctrl+Delete

// Command shortcuts (only fires keydown, no text insertion)
inputEvent.insert(el, "z", { metaKey: true });  // Cmd+Z
```

For `<input>` or `<textarea>`, use `@testing-library/user-event` directly since it handles those properly.
