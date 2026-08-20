AlertError from beefy-v2. Use via `window.BeefyV2.AlertError` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Default

```jsx
() => (
  <AlertError>Insufficient balance to cover the network fee.</AlertError>
)
```

### LongCopy

```jsx
() => (
  <AlertError>
    The transaction was rejected. Check that your wallet is connected to the correct network and
    that you have approved the token spend, then try again.
  </AlertError>
)
```
