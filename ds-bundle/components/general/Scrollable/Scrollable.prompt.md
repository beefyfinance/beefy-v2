Scrollable from beefy-v2. Use via `window.BeefyV2.Scrollable` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ScrollableProps {
  children: React.ReactNode;
  autoHeight?: number | boolean;
  css?: CssStyles;
  shadowCss?: CssStyles;
  topShadowCss?: CssStyles;
  bottomShadowCss?: CssStyles;
  leftShadowCss?: CssStyles;
  rightShadowCss?: CssStyles;
  thumbCss?: CssStyles;
  hideShadows?: boolean;
  scrollContainer?: boolean;
}
```

## Related

`ScrollableDrawer`
