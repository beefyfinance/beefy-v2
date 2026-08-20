Modal from beefy-v2. Use via `window.BeefyV2.Modal` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
  position?: any;
}
```

## Examples

### Open

```jsx
() => (
  <Modal open onClose={noop}>
    <div style={{ padding: 24, display: 'grid', gap: 16, minWidth: 320 }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>Confirm deposit</div>
      <div style={{ opacity: 0.8 }}>
        You are depositing 1.42 BIFI into the BIFI Vault. Rewards compound automatically.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="transparent" onClick={noop}>Cancel</Button>
        <Button variant="cta" onClick={noop}>Confirm</Button>
      </div>
    </div>
  </Modal>
)
```

### Narrow

```jsx
() => (
  <Modal open onClose={noop}>
    <div style={{ padding: 24, display: 'grid', gap: 12, maxWidth: 280 }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Transaction submitted</div>
      <div style={{ opacity: 0.8 }}>Waiting for confirmation on Arbitrum.</div>
    </div>
  </Modal>
)
```
