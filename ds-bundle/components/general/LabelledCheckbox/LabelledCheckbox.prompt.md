LabelledCheckbox from beefy-v2. Use via `window.BeefyV2.LabelledCheckbox` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface LabelledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  containerCss?: CssStyles;
  iconCss?: CssStyles;
  labelCss?: CssStyles;
  checkedIconCss?: CssStyles;
  checkVariant?: "circle" | "square";
  endAdornment?: React.ReactNode;
}
```

## Examples

### Square

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <LabelledCheckbox checked onChange={noop} label="Boosted vaults" />
    <LabelledCheckbox checked={false} onChange={noop} label="Retired vaults" />
  </div>
)
```

### Circle

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <LabelledCheckbox checkVariant="circle" checked onChange={noop} label="Single asset" />
    <LabelledCheckbox
      checkVariant="circle"
      checked={false}
      onChange={noop}
      label="Liquidity pool"
    />
  </div>
)
```

### WithAdornment

```jsx
() => (
  <LabelledCheckbox
    checked
    onChange={noop}
    label="Stablecoins only"
    endAdornment={<span style={{ opacity: 0.6 }}>142</span>}
  />
)
```
