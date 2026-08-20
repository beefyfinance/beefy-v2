Marquee from beefy-v2. Use via `window.BeefyV2.Marquee` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface MarqueeProps {
  /** content to scroll (duplicated for a gap-less, seamless loop) */
  children: React.ReactNode;
  /** scroll speed in px/second — longer content takes proportionally longer */
  speed?: number;
  /** gap in px between the end of one copy and the start of the next (the loop seam). Lower it to keep items flowing tightly  */
  gap?: number;
  /** applied to the scrolling content element — use it to style `children` */
  className?: string;
}
```
