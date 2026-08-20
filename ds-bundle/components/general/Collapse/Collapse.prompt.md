Collapse from beefy-v2. Use via `window.BeefyV2.Collapse` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface CollapseProps {
  in: boolean;
  children: React.ReactNode;
}
```
