ButtonWithTooltip from beefy-v2. Use via `window.BeefyV2.ButtonWithTooltip` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ButtonWithTooltipProps {
  placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end";
  offset?: number;
  openOnClick?: boolean;
  openOnHover?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  openOnFocus?: boolean;
  variant?: "light" | "dark";
  layer?: 0 | 1 | 2;
  size?: "normal" | "compact";
  arrowWidth?: number;
  arrowHeight?: number;
  disabled?: boolean;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
```
