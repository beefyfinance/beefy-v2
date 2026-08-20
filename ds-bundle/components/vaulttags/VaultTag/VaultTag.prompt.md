VaultTag from beefy-v2. Use via `window.BeefyV2.VaultTag` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface VaultTagProps {
  css?: CssStyles;
  icon?: React.ReactNode;
  text: React.ReactNode;
  order?: "icon-text" | "text-icon";
}
```

## Examples

### Default

```jsx
() => (
  <Row>
    <VaultTag text="CLM" />
  </Row>
)
```

### Tags

```jsx
() => (
  <Row>
    <VaultTag text="CLM" />
    <VaultTag text="Boosted" />
    <VaultTag text="Points" />
    <VaultTag text="Retired" />
  </Row>
)
```

### WithIcon

```jsx
() => (
  <Row>
    <VaultTag icon={<span aria-hidden>🔥</span>} text="Boosted" />
    <VaultTag order="text-icon" icon={<span aria-hidden>⚡</span>} text="Zappable" />
  </Row>
)
```

## Related

`VaultTagWithTooltip`
