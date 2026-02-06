# Content Editor

A React-based rich text editor for Notion-style block content.

## Motivation

Existing editors for Notion-type blocks are overcomplicated and badly typed. I made a well-typed alternative.

## React + contenteditable

React wants full control over the DOM. Contenteditable modifies the DOM without telling React.
This is a problem - React may clobber your edits on re-render.

This is solved this by only re-rendering on block-level mutations (adding, removing, splitting blocks).
Inline text changes happen in the contenteditable and are preserved until a block-level change forces a re-render.

We use `contentEditable="plaintext-only"` to avoid the browser's native rich text editing (which creates messy DOM).
Formatting is handled by translating keyboard events to changes in the model and rendered as styled spans.

## Core Concepts

**Block / RichText**: The data model A _block_ is a paragraph, heading, list item, etc. which gets rendered as a
content-editable element and managed by the editor, while _rich-text_ is an array of text elements containing a link
annotations.

[**ContentEditor**](editor/use-content-editor.ts): The editor instance that centralizes the state.

[**ContentEditorPlugin**](editable/types.ts): A hook that implements a piece of editor functionality by bridging
component props and editor state. Plugins return DOM props (event handlers, refs) that get spread onto block elements.

## Plugin Architecture

Plugins are curried functions with two phases:

```typescript
type ContentEditorPlugin<TDetail = ContentEditableProps>
  = (editor: ContentEditor)
  => (block: Block) => TDetail;
```

The two-phased approach allows you to create composable plugins with isolated functionalities while providing them with
full React hooks capabilities and shared state and context.

**Generics:**

- `TDetail` - Return type of the block factory. Defaults to `ContentEditableProps`. Plugin factories may use a different
  type which gets transformed into ContentEditableProps before being ready to use.

### Phase 1: Editor Setup

```typescript
const useMyPlugin: ContentEditorPlugin = (editor) => {
  // This is Phase 1
  // Called once when the plugin hook is invoked
  // React hooks work here - this IS a hook body

  useEffect(() => {
    // subscribe to editor.bus events, setup timers, etc.
  }, []);

  // Return the Phase 2 function
  return (block) => ({ /* ... */ });
};
```

Phase 1 runs when the plugin hook is called with the editor (e.g., `useMyPlugin(editor)`). Since plugins are hooks,
phase 1 executes as part of that hook's body. This is why React hooks are allowed - you're inside a hook.

Phase 1 captures `editor` in a closure. Any refs, callbacks, or effects you create here persist for the
lifetime of the editor component.

### Phase 2: Block Props Factory

```typescript
  return (block) => {
  // This is Phase 2
  // Called for EACH block during render
  // NO hooks - this is a render-time loop

  return {
    onKeyDown(e) {
      // Make changes to the current block and saves it to history
      editor.update(transformBlock(block, e));
      // Commit changes to react state and refresh
      editor.commit();
      // Prevent other plugins from handling this event any further
      e.preventDefaut();
    },
  };
};
```

Phase 2 is the function returned by phase 1. It gets called in a loop:

```tsx
blocks.map(block => <Block {...editable(block)} />)
```

For each block, phase 2 returns `ContentEditableProps` - the ref and event handlers that make the block editable.

### Composition

When plugins are composed with `composePlugins(a, b, c)`:

- Handlers execute left-to-right (a, then b, then c)
- First plugin to call `e.stopPropagation()` stops the chain
- `ref` callbacks all run (not chained)

```typescript
const useCombinedPlugin = composePlugins(
  usePluginA,
  usePluginB,
);
```

## Writing a Plugin

### Basic Example: Keyboard Shortcut

```typescript
const useBoldPlugin: ContentEditorPlugin = (editor) => {
  return (block) => ({
    onKeyDown(e) {
      if (e.key === "b" && e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const updated = toggleBold(block, getSelectionRange(e.currentTarget));
        editor.update(updated);
        editor.commit();
      }
    },
  });
};
```

### Using Transactions

For multi-block operations, wrap in a transaction for atomic undo:

```typescript
onKeyDown(e)
{
  if (e.key === "Backspace" && atBlockStart) {
    e.preventDefault();
    editor.transaction(() => {
      editor.update(mergedBlock);
      editor.remove(currentBlock);
    });
    editor.commit();
  }
}
```

