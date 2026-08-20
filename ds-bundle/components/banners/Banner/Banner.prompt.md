Banner from beefy-v2. Use via `window.BeefyV2.Banner` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface BannerProps {
  icon?: React.ReactNode;
  text: React.ReactNode;
  onClose?: () => void;
  variant?: "info" | "warning" | "error";
}
```

## Examples

### Info

```jsx
() => (
  <Banner variant="info" text="Beefy is now live on Sonic — deposit to earn boosted rewards." />
)
```

### Warning

```jsx
() => (
  <Banner
    variant="warning"
    text="Scheduled RPC maintenance on Arbitrum between 14:00 and 15:00 UTC."
  />
)
```

### Error

```jsx
() => (
  <Banner variant="error" text="Unable to reach the price feed. Values may be out of date." />
)
```

### Dismissible

```jsx
() => (
  <Banner
    variant="info"
    text="Vault fees changed on 1 August. Review the updated fee breakdown."
    onClose={noop}
  />
)
```
