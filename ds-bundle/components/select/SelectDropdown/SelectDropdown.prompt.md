SelectDropdown from beefy-v2. Use via `window.BeefyV2.SelectDropdown` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface SelectDropdownProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}
```
