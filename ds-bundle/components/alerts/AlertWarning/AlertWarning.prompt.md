AlertWarning from beefy-v2. Use via `window.BeefyV2.AlertWarning` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Default

```jsx
() => (
  <AlertWarning>Withdrawing early forfeits the current boost rewards.</AlertWarning>
)
```

### LongCopy

```jsx
() => (
  <AlertWarning>
    This vault holds an experimental asset with limited liquidity. Large withdrawals may incur
    significant slippage — understand the risks before depositing.
  </AlertWarning>
)
```
