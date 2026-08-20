ReloadSpinner from beefy-v2. Use via `window.BeefyV2.ReloadSpinner` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ReloadSpinnerProps {
  state?: boolean | "disabled";
  autoRefresh?: boolean;
  autoRefreshSeconds?: number;
  onClick?: () => void;
  css?: CssStyles;
}
```
