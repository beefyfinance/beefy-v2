ToggleButtons from beefy-v2. Use via `window.BeefyV2.ToggleButtons` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Default

```jsx
() => (
  <ToggleButtons value="1W" options={timeframes} onChange={noop} />
)
```

### Filter

```jsx
() => (
  <ToggleButtons
    variant="filter"
    value="active"
    options={[
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'eol', label: 'Retired' },
    ]}
    onChange={noop}
  />
)
```

### Card

```jsx
() => (
  <div style={{ width: 420 }}>
    <ToggleButtons
      variant="card"
      fullWidth
      value="deposit"
      options={[
        { value: 'deposit', label: 'Deposit', subtitle: '12.4% APY' },
        { value: 'withdraw', label: 'Withdraw', subtitle: '1.42 mooBIFI' },
      ]}
      onChange={noop}
    />
  </div>
)
```

### Disabled

```jsx
() => (
  <ToggleButtons disabled value="1D" options={timeframes} onChange={noop} />
)
```
