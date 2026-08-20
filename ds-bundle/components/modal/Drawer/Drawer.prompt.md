Drawer from beefy-v2. Use via `window.BeefyV2.Drawer` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface DrawerProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  position?: any;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
}
```
