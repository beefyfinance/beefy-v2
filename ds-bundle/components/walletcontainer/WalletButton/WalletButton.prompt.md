WalletButton from beefy-v2. Use via `window.BeefyV2.WalletButton` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface WalletButtonProps {
  initializing: boolean;
  connected: boolean;
  known: boolean;
  error: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: boolean | Iterable<ReactI18NextChild> | React.ReactNode;
}
```
