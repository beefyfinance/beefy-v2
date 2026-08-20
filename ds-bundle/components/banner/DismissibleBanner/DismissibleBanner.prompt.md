DismissibleBanner from beefy-v2. Use via `window.BeefyV2.DismissibleBanner` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface DismissibleBannerProps {
  icon?: React.ReactNode;
  text: React.ReactNode;
  onClose?: () => void;
  variant?: "info" | "warning" | "error";
  id: string;
}
```

## Examples

### Info

```jsx
() => (
  <DismissibleBanner
    id="preview-info"
    variant="info"
    text="Beefy is now live on Sonic — deposit to earn boosted rewards."
  />
)
```

### Warning

```jsx
() => (
  <DismissibleBanner
    id="preview-warning"
    variant="warning"
    text="Scheduled RPC maintenance on Arbitrum between 14:00 and 15:00 UTC."
  />
)
```
