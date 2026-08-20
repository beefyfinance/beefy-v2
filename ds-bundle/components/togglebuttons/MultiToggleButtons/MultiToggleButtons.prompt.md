MultiToggleButtons from beefy-v2. Use via `window.BeefyV2.MultiToggleButtons` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface MultiToggleButtonsProps {
  value: TValue[];
  onChange: (value: TValue[]) => void;
  ButtonComponent?: FC<MultiToggleButtonProps<TValue>>;
}
```
