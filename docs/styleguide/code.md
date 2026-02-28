# Code Style Guide

## Naming Conventions

### `common/`

- Schemas and types derived from external resources should keep the source naming convention.
  - Notion object types are `snake_case` to match Notion’s source shape.
- Variable names should follow the naming style of their type.
  - Example: for `zNotion.blocks.heading_1`, a variable like `my_heading_1_block` is good.
- Export inferred types together with their Zod schema using aligned names.
  - `type property = z.infer<typeof property>`: types inferred from schemas should be the same.
  - `zProperty = typeof property`: type of the Zod schemas should be prefixed by `z`.
- Function/helper exports use `camelCase`.
- File names use `kebab-case`.
- Higher-level DTOs (for example `NotionResource`) and namespaces use `PascalCase`.

### `web/`

- Component file names use `PascalCase`.
- Component exports use `PascalCase`.
- CSS Module files should match component casing.
- SCSS partials should be prefixed with `_` (for example `_theme.scss`).

## Typescript

- **Rule of thumb: If you don't need it, don't do it!**
  - **DO NOT USE ANY ANY ( •̀ ᴖ •́ ) ! ! !**
    - Use `unknown` for untrusted input, narrow with type guards before use.
    - Avoid `satisfies` or `as` casts altogether. Prefer automatic inference instead.
  - **Prefer inference over manual typing.**
    - Let Typescript infer types whenever possible.
    - _If_ Typescript complains about the type being too narrow, use `satisfies` to validate shape compatibility without
      widening the inferred type too much.
    - _If_ Typescript complains about the type being too wide, use `as const` for scalar/object literals when you need
      literal preservation.
  - **Derive types instead of repeating them.**
    - Use `Extract`, `Omit`, and `Pick` to refine unions and build derived shapes.
    - Prefer composition from existing types over re-defining property lists.
    - @see helpers in `@notion-site/common/types/union.js`.
- **Keep function inputs flexible.**
  - If a function only needs part of an object, type the parameter with `Pick<...>`. This reduces coupling and makes
    functions easier to reuse and test.
- **Prefer `type` aliases for exported shapes.**
  - Use `type` for object types. Reserve `interface` for global augmentation.

### Generics

- **Use generics when stuff depends on input type.**
  - Use generics to preserve input/output relationships (identity, transforms, keyed access, etc.).
  - Prefer truly generic parameters first (`<T>`), without `extends` and without defaults, when no real domain
    constraint exists.
  - Add constraints only when they are semantically required by the domain, not just to make implementation easier.
- **When a generic constraint is required, name and export the constraint shape.** Reuse that same constraint type in
  helpers/utilities that consume the generic family. This keeps related generics composable across modules.
  - Example pattern:
  ```ts
  type AnyData = { ... };
  type MyType<TData extends AnyData>;
  ```
- **Provide overloads to avoid `as` casts.**
  - Most cases should be simple enough to be able to operate on
  - Generic functions can be challenging to implement without running into TS
    errors, even for perfectly valid implementations, especially when you're using operations that don't preserve the
    generics, like `Array.map`. If you run into such errors, you can use this pattern to get around issues without
    having
    to resort to typecast:
    ```ts
    // common/src/utils/notion/blocks.ts
    // Add an overload that exposes the generic parameter for callers who need explicit control.
    export function extract<T extends BlockType>(block: Block<T>): UniqueNode<T>;
    // Add a second overload with the generic applied to the default followed by implementation.
    // No generic, no probleme 👍
    export function extract(block: Block): Node {
      // ...
    }
    ```
- **Use constrained generics for finite domains (for example unions).**
  - For closed sets, constrain with `extends` the union of allowed values.
  - In those cases, prefer a default to the full union (`<T extends U = U>`) so callers can omit type application when
    they do not care about specialisation.
  - @see e.g. `Notion.Block<T>`.

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

## Avoid Single-Use Variables

If a variable or function is only used once, inline it unless it materially improves readability.
This includes intermediate values that can be computed inline without increasing complexity.
Prefer direct expressions to avoid unnecessary noise.

## Document Functions

When writing utility modules, add a short jsdoc explaining what the function is doing if it isn't trivial.
If the function is being exported, be more descriptive and add **`@note`** s about behaviour and edge cases.

- **You don't need to use `@params`**: Params should already be clear by the type annotations.
- **You can use `@return`** to explain how to interpret the return type.
- **You should use `@internal`**: for internal helpers. Mark non-exported functions with `/** @internal */`. A one-line
  JSDoc is fine for trivial internals.

```ts
// Internal helper - one line
/**
 * Get caret's x position, or null if not on the boundary line for the given direction.
 * @internal
 */
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
  // ...
}
```

## Pattern: Flat Functions

### Motivation

Logic is hard: it is almost too difficult for my little monkey brain sometimes (although I do make up with perseverence
and enough creativity to never run out of options)... imagine how hard it must be for a little machine who doesn't even
have a brain, though. That's why this document exists.
I like to keep my logic linear, rhythmic, and nice to read (kinda like how I like to write in real life), and follow
patterns. I found this pattern easy to reason with, and used it widely across the codebase. Let us start with a
practical example:

### Basic Structure

 ```ts
// use-block-mutation-plugin.ts
switch (e.key) {
  case "ArrowUp": {
    // Early return specific for this case
    if (!prevElement) return;

    // Get variable
    const range = getVerticalNavigationRange(
      e.currentTarget,
      prevElement,
      "up",
    );

    // Conditional return
    if (!range) return;

    // The variable is narrowed now, you can use it to do some side effects.
    prevElement.focus();
    setSelectionRange(prevElement, range);

    // Handle what happens with the event next and return
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  // . . . more cases
}

```

Keep a space around each return and block of side-effects
so I don't have to insert a `\n` when I decide to drop in a `console.log` to see what's going on there.

### Use Cases

- **Helper functions:** This works well for helper functions to avoid too much complexity in one place,
  especially the ones mede to isolate complex logic,
  the type of code that tends to turn into spaghetti.
- **Loops and switch-case:** This avoids over-complicating already complex cases:
  loops, switches, if/else chains, match branches... these are already complex
  adding more branches inside creates for the reviewer some cognitive overhead.

### Pattern: Type + Helper Object

#### Motivation

Keeping a type and its helpers together makes usage predictable and keeps naming simple and provides easy imports via
IDE auto-complete. The type defines the shape, the object defines operations over that same shape. Both are exported
with the same name from the same file. This avoids scattering logic across multiple files and reduces import noise. When
you see `X`, you immediately know where `X.parse`, `X.is`, `X.options`, or other helpers live.

#### Basic Structure

```ts
// caret-target.ts

/**
 * Inline anchor candidate.
 * - `text`: text node inside an inline child element.
 * - `element`: empty inline child element (no text content yet).
 */
export type CaretTarget =
  | { type: "text"; node: Text; offset: number }
  | { type: "element"; element: HTMLElement; offset: number };

/**
 * Caret target that can receive a selection directly.
 */
export type AnchoredCaretTarget = Extract<CaretTarget, { type: "text" }>

/**
 * Utilities to map between a plain text offset in a root editable element and a
 * concrete DOM caret target.
 */
export const CaretTarget = {
  getAnchor,
  fromAnchor,

  // Trivial methods can be defined inline.
  isAnchored(target: CaretTarget): target is AnchoredCaretTarget {
    return target.type !== "element";
  },
};

/**
 * Try to find where the caret could land inside of the element at the given offset.
 * @returns `null` when the offset is out of bounds.
 */
function getAnchor(element: HTMLElement, offset: number): CaretAnchor | null {
  // ...
}

/** @internal */
function textAnchor(node: Text | null, root: HTMLElement): Anchor | null {
  // ...
}
```

Organize exports in this order:

1. **Type exports at top** — each with JSDoc explaining variants/cases.
2. **Namespace object** — with JSDoc describing what the module does. Define methods inline if they are trivial, or
   below the export otherwise.
3. **Internal functions** — marked with `@internal`. If the helper is only used by one public method, keep it below that
   method. If it is used across the whole module, keep it at the bottom of the module.

#### Use Cases

- **Simple case:** Use this when the type is simple and concrete
  (i.e. not generic, based on simple union / intersection of records and scalars),
  and the helpers are small predicates that operate directly on that type.
- **Zod schema case:** It is nice to infer types using `z.infer`,
  but then you also have to define the helpers in the same file.
  In order to avoid name collision, you can use `Object.assign(ctor, { ... })`
  and export everything as a nice little bundle.
  ```ts
  import { z } from "zod";
  
  const zStatus = z.enum(["draft", "published", "archived"]);
  
  export type Status = z.infer<typeof zStatus>;
  
  export const Status = Object.assign(zStatus, {
    isPublished: (s: Status) => s === "published",
    isCompleted: (s: Status) => s === "published" || s === "archived",
  });
  ```
- **Family-namespace case:** When you have related domains thnat each need their own types and helpers,
  use a namespace to aggregate them. Each domain gets its own module with a type and named export helpers.
  The namespace re-exports sub-modules via `export import`.
  ```ts
  // block.ts — sub-module
  export type Block =
    | { id: string; type: "paragraph"; text: string }
    | { id: string; type: "heading"; text: string; level: 1 | 2 | 3 };
  export const extract = (block: Block) => block.text;
  export const map = (block: Block, f: (text: string) => string) => ({ ...block, text: f(block.text) });
  ```
  Note that you can re-export main types at the top level for convenience (e.g., `Notion.Block` for the type,
  `Notion.Block.extract()` for helpers).
  ```ts
  // index.ts — namespace
  import * as _Block from "./block.js";
  import * as _RTF from "./rich-text.js";

  export namespace Notion {
    export type Block = _Block.Block;
    export type RichText = _RTF.RichText;

    export import Block = _Block;
    export import RTF = _RTF;
  }
  ```
  
