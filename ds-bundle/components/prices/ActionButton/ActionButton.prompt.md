ActionButton from beefy-v2. Use via `window.BeefyV2.ActionButton` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ActionButtonProps {
  css?: CssStyles;
  disabled?: boolean;
}
```

## Examples

### Default

```jsx
() => <ActionButton onClick={noop}>$</ActionButton>
```

### LinkStyle

```jsx
() => <ActionButton link onClick={noop}>Buy BIFI</ActionButton>
```

### Row

```jsx
() => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <ActionButton onClick={noop}>$</ActionButton>
    <ActionButton onClick={noop}>%</ActionButton>
    <ActionButton link onClick={noop}>Buy BIFI</ActionButton>
  </div>
)
```
