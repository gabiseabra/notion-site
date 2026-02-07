# Content Editor

A React-based rich text editor for Notion-style block content.

## Motivation

Existing editors for Notion-type blocks are overcomplicated and badly typed. I made a well-typed alternative.

## React + contenteditable

React wants full control over the DOM, but its reconciliation loop is too expensive to update on every keystroke.
Contenteditable is made for that and runs super smooth, but it modifies the DOM without telling React, which causes
several issues, as React's reconciliation may conflict with native edits on re-render: your changes will be overwritten
mid-typing if the model decides to update and is not in sync with the actual state, and your selection state may be lost
between updates.

Theoretically, you _could_ register input events in a block node such as `p`, let content-editable do its thing and only
update the state `onblur`, or when the cursor goes idle for a while, or when you must perform a block mutation (like
adding or deleting a block). This is assuming that we could make inline editing stable under the control of
content-editable, while block elements would be fully controlled by React.
This actually works if you're dealing with plain-text: you can use `content-editable="plaintext-only"` to disable the
DOM from creating inline nodes such as `b` on `ctrl+b`, and if you pass only `string` to the block node's `children`
prop, then there will be no more nodes to reconcile beyond the block-level, therefore no problem. But then your content
editor would essentially work like a `textarea` 🤷‍♀️ (this is true, @see [use-plain-text-plugin.test.tsx](./editable/use-plain-text-plugin.test.tsx))

But this approach doesn't work if you're dealing with more complex data that render into more HTML. Even if you're extra
careful to keep inline and block mutations handled separately, React's reconciliation still has to perform unmount
effects on its managed nodes, so rendering inline nodes in React is challenging here. Theoretically you could render the
rich text content in a separate React root and unmount it when its parent block unmounts, but this isn't needed if you'
re able to render the data into HTML (which is the case for Notion), then it's as simple as using
`dangerouslySetInnerHTML` in your block node to render the content.

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

