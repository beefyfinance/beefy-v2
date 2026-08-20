ExternalLink from beefy-v2. Use via `window.BeefyV2.ExternalLink` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ExternalLinkProps {
href?: string;
children?: React.ReactNode;
className?: string;
title?: string;
onClick?: React.MouseEventHandler<HTMLAnchorElement>;
/** skip the Farcaster mini-app URL handler and open normally */
bypassMiniApp?: boolean;
}
```
