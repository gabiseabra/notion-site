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

- **DO NOT USE ANY ANY ( •̀ ᴖ •́ ) ! ! !**
  - Use `unknown` for untrusted input, narrow with type guards before use.
- **Prefer inference over manual typing.**
  - Let TypeScript infer types whenever possible.
  - Use `as const` for scalar/object literals when you need literal preservation.
  - Use `satisfies` to validate shape compatibility without widening the inferred type.
- **Derive types instead of repeating them.**
  - Use `Extract`, `Omit`, and `Pick` to refine unions and build derived shapes.
  - Prefer composition from existing types over re-defining property lists.
  - @see helpers in `@notion-site/common/types/union.js`.
- **Keep function inputs flexible.**
  - If a function only needs part of an object, type the parameter with `Pick<...>`. This reduces coupling and makes functions easier to reuse and test.
- **Prefer `type` aliases for exported shapes.**
  - Use `type` for object types. Reserve `interface` for global augmentation.

### Generics

- **Use generics when behaviour depends on input type.**
  - Use generics to preserve input/output relationships (identity, transforms, keyed access, etc.).
  - Prefer truly generic parameters first (`<T>`), without `extends` and without defaults, when no real domain constraint exists.
  - Add constraints only when they are semantically required by the domain, not just to make implementation easier.
- **When a generic constraint is required, name and export the constraint shape.** Reuse that same constraint type in helpers/utilities that consume the generic family. This keeps related generics composable across modules.
  - Example pattern:
  ```ts
  type AnyData = { ... };
  type MyType<TData extends AnyData>;
  ```
- **Use constrained generics for finite domains (for example unions).**
  - For closed sets, constrain with `extends` the union of allowed values.
  - In those cases, prefer a default to the full union (`<T extends U = U>`) so callers can omit type application when they do not care about specialisation.
  - @see e.g. `Notion.Block<T>`.
- **Provide overloads to avoid `as` casts.** Generic functions can be challenging to implement without running into TS errors, even for perfectly valid implementations, especially when you're using operations that don't preserve the generics, like `Array.map`. If you run into such errors, you can use this pattern to get around issues without having to resort to typecast: 
  - Add an overload that exposes the generic parameter for callers who need explicit control.
  - Add a second overload with the generic applied to the default followed by implementation. No generic, no probleme 👍
  ```ts
  // common/src/utils/notion/blocks.ts
  export function extract<T extends BlockType>(block: Block<T>): UniqueNode<T>;
  export function extract(block: Block): Node {
    // ...
  }
  ```


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

### Motivation

Logic is hard: it is almost too difficult for my little monkey brain sometimes (although I do make up with perseverence and enough creativity to never run out of options)... imagine how hard it must be for a little machine who doesn't even have a brain, though. That's why this document exists.

I like to keep my logic linear, rhythmic, and nice to read (kinda like how I like to write in real life), and follow patterns. I found this pattern easy to reason with, and used it widely across the codebase. Let us start with a practical example:

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

###  Use Cases

- **Helper functions:** This works well for helper functions to avoid too much complexity in one place,
  especially the ones mede to isolate complex logic,
  the type of code that tends to turn into spaghetti.
- **Loops and switch-case:** This avoids over-complicating already complex cases:
  loops, switches, if/else chains, match branches... these are already complex
  adding more branches inside creates for the reviewer some cognitive overhead.



### Pattern: Type + Helper Object

#### Motivation

Keeping a type and its helpers together makes usage predictable and keeps naming simple.

The type defines the shape.
The object defines operations over that same shape.
Both are exported with the same name from the same file.

This avoids scattering logic across multiple files and reduces import noise.
When you see `X`, you immediately know where `X.parse`, `X.is`, `X.options`, or other helpers live.

#### Basic Structure

```ts
// history.ts
export type EditorCommand =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "insert"; text: string };

export const EditorCommand = {
  isUndo: (cmd: EditorCommand) => cmd.type === "undo",
  isRedo: (cmd: EditorCommand) => cmd.type === "redo",
  isInsert: (cmd: EditorCommand): cmd is Extract<EditorCommand, { type: "insert" }> =>
    cmd.type === "insert",
};
```

Keep this flat.
No classes.
No namespace nesting.
Just one type and one object with focused helpers.

#### Use Cases

- **Simple case:** Use this when the type is simple and concrete
  (i.e. not generic, based on simple union / intersection of records and scalars),
  and the helpers are small predicates that operate directly on that type.
- **Zod schema case:** It is nice to infer types uding z.infer,
  but then you also have to define the helpers in the same file.
  In order to avoid name collision and export everything as a nice little bundle,
  you can use `Object.assign(ctor, { ... })`

```ts
import { z } from "zod";

const zStatus = z.enum(["draft", "published", "archived"]);

export type Status = z.infer<typeof zStatus>;

export const Status = Object.assign(zStatus, {
  isPublished: (s: Status) => s === "published",
  isCompleted: (s: Status) => s === "published" || s === "archived",
});
```


