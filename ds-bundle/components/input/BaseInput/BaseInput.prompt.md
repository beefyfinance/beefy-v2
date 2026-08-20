BaseInput from beefy-v2. Use via `window.BeefyV2.BaseInput` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface BaseInputProps {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  inputRef?: React.Ref;
}
```

## Examples

### Default

```jsx
() => (
  <div style={{ width: 320 }}>
    <BaseInput placeholder="0.00" value="1.42" onChange={noop} />
  </div>
)
```

### Placeholder

```jsx
() => (
  <div style={{ width: 320 }}>
    <BaseInput placeholder="Search vaults" value="" onChange={noop} />
  </div>
)
```

### Adornments

```jsx
() => (
  <div style={{ width: 320 }}>
    <BaseInput
      value="1.42"
      onChange={noop}
      startAdornment={<span>BIFI</span>}
      endAdornment={<span style={{ opacity: 0.6 }}>MAX</span>}
    />
  </div>
)
```

### Disabled

```jsx
() => (
  <div style={{ width: 320 }}>
    <BaseInput disabled value="0.00" onChange={noop} />
  </div>
)
```
