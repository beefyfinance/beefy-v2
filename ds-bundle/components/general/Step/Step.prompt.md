Step from beefy-v2. Use via `window.BeefyV2.Step` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface StepProps {
  stepType: "bridge";
  title?: string;
  onBack?: () => void;
  children: React.ReactNode;
  titleAdornment?: React.ReactNode;
  contentCss?: CssStyles;
  noPadding?: boolean;
}
```
