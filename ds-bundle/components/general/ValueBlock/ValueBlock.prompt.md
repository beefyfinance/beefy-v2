ValueBlock from beefy-v2. Use via `window.BeefyV2.ValueBlock` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ValueBlockProps {
  label: React.ReactNode;
  value: React.ReactNode;
  textContent?: boolean;
  tooltip?: React.ReactNode;
  usdValue?: React.ReactNode;
  loading?: boolean;
  blurred?: boolean;
  labelCss?: CssStyles;
  valueCss?: CssStyles;
  priceCss?: CssStyles;
}
```
