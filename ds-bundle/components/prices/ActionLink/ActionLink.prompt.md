ActionLink from beefy-v2. Use via `window.BeefyV2.ActionLink` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Default

```jsx
() => (
  <ActionLink href="https://app.beefy.com/vault/bifi-vault">↗</ActionLink>
)
```

### LinkStyle

```jsx
() => (
  <ActionLink link href="https://app.beefy.com/buy">Buy BIFI</ActionLink>
)
```

### Row

```jsx
() => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <ActionLink href="https://app.beefy.com">↗</ActionLink>
    <ActionLink link href="https://app.beefy.com/buy">Buy BIFI</ActionLink>
  </div>
)
```
