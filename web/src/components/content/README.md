# Content Editor

React-based content editor infrastructure for Notion-style block data.

## Where Things Live

- `editor/` Core controller: `useContentEditor`, history, events, and types.
- `editable/` Plugins: inline mutation, block mutation, history, navigation, hotkeys, auto-commit, Notion wiring.
- `chrome/` Toolbars and editor chrome.
- `Editor.tsx`, `InlineEditor.tsx` Notion editor wiring (controller + plugins + view).
- `RootBlock.tsx` View-level nesting/structure for flat block lists.
- `Block.tsx`, `RichText.tsx` Render primitives.

## Architecture (MVC)

The editor is a controller only. It does not define your model or render anything.

- Model: your block type (`TBlock`).
- Controller: `ContentEditor<TBlock>` (state + history + event bus) + `ContentEditorPlugin<TBlock>`.
- View: your React components.

This avoids any model conversion layer and keeps the editor fully generic and typed.

### One Contenteditable Per Block

This editor manages an array of blocks, and each block gets its own contenteditable element.

```tsx
blocks.map(block => <Block {...editable(block)} contentEditable />)
```

This isolates contenteditable's effects to the inline level, keeps contenteditable bullshit down to a manageable level. The editor processes events by updating the model internally and lets them pass through to the browser's default handling.

### Block vs Inline Mutations

Block and inline mutations are handled separately, and this separation is key to smooth typing.
- **Block mutations are committed immediately:** split/merge operations update history and state right away so the affected blocks re-render.
- **Inline mutations are deferred:** typing stays native while the inline plugin records a pending edit (delta + selection) and commits when idle.

## Plugin System

Plugins are curried functions with two phases:

```ts
const myGenericPlugin: AnyContentEditorPlugin = (editor) => {
  // - Phase 1: receives the editor instance, uses React hooks, sets up shared state.
  return (block) => {
    // - Phase 2: receives a block and returns event handlers for that block.
    return {
      onKeyDown() {
        // . . . 
      }
    }
  }
}

```

### Generics

```ts
type ContentEditorPlugin<
  // Type of the editor instance's blocks.
  TBlock,
  // Return type of the block factory. Defaults to `ContentEditableProps`.
  // Plugin factories may use a different type which gets transformed into
  // ContentEditableProps before being ready to use.
  TProps
> = (editor: ContentEditor<TBlock>)
  => (block: TBlock)
  => TProps;
```

### Composition

- Handlers execute left-to-right.
- First plugin to call `e.stopPropagation()` stops the chain.

```typescript
const useCombinedPlugin = composePlugins(
  usePluginA,
  usePluginB,
);
```

### Batching

Batching groups multiple editor commands into a single history entry using `batchId`.

- Pass `batchId` in `update/remove/split` to accumulate commands.
- `flush()` ends the batch and (if not canceled) pushes a single apply command to history.
- `commit()` always flushes first, then syncs React state.
- `inBatch(exceptId?)` indicates whether a batch is currently active.

`flush` is cancelable. Calling `preventDefault()` skips the history write but still ends the batch.
