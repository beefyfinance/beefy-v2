AssetsImage from beefy-v2. Use via `window.BeefyV2.AssetsImage` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface AssetsImageProps {
  chainId?: "base" | "polygon" | "ethereum" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | (string & {}) /* +25 more */;
  assetSymbols: string[];
  size?: number;
  css?: CssStyles;
}
```

## Related

`AssetsImageWithChain`
