Toggle from beefy-v2. Use via `window.BeefyV2.Toggle` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  css?: CssStyles;
}
```

## Examples

### Checked

```jsx
() => <Toggle checked onChange={noop} />
```

### Unchecked

```jsx
() => <Toggle checked={false} onChange={noop} />
```

### WithLabel

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Toggle checked onChange={noop} endAdornment={<span>Hide zero balances</span>} />
    <Toggle
      checked={false}
      onChange={noop}
      endAdornment={<span>Show retired vaults</span>}
    />
  </div>
)
```

## Related

`ToggleButton`, `ToggleButtons`
