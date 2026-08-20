StatusPill from beefy-v2. Use via `window.BeefyV2.StatusPill` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Ready

```jsx
() => <StatusPill mode="ready" text="Ready" />
```

### Waiting

```jsx
() => <StatusPill mode="waiting" text="Waiting" />
```

### Both

```jsx
() => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <StatusPill mode="ready" text="Claimable" />
    <StatusPill mode="waiting" text="Vesting" />
  </div>
)
```
