Collapsable from beefy-v2. Use via `window.BeefyV2.Collapsable` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Examples

### Open

```jsx
() => (
  <Collapsable openByDefault title="Vault details">
    <div style={{ display: 'grid', gap: 8, opacity: 0.85 }}>
      <div>Strategy: Compound BIFI rewards every 4 hours</div>
      <div>Deposit fee: 0%</div>
      <div>Withdrawal fee: 0%</div>
    </div>
  </Collapsable>
)
```

### Closed

```jsx
() => (
  <Collapsable title="How are fees calculated?">
    <div style={{ opacity: 0.85 }}>Beefy charges a performance fee on harvested rewards only.</div>
  </Collapsable>
)
```

### Stacked

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Collapsable openByDefault title="Vault details">
      <div style={{ opacity: 0.85 }}>Compounds BIFI rewards roughly every 4 hours.</div>
    </Collapsable>
    <Collapsable title="Risks">
      <div style={{ opacity: 0.85 }}>Smart contract risk, impermanent loss, price volatility.</div>
    </Collapsable>
  </div>
)
```
