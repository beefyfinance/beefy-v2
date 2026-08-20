MultiToggleButton from beefy-v2. Use via `window.BeefyV2.MultiToggleButton` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface MultiToggleButtonProps {
  onClick: (isSelected: boolean, value: TValue) => void;
}
```
