BasicTooltipContent from beefy-v2. Use via `window.BeefyV2.BasicTooltipContent` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface BasicTooltipContentProps {
  title: string;
  content?: React.ReactNode;
}
```
