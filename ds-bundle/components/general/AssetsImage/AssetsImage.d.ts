import * as React from 'react';

/**
 * AssetsImage — from beefy-v2@0.1.0.
 */
export interface AssetsImageProps {
  chainId?: "base" | "polygon" | "ethereum" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | (string & {}) /* +25 more */;
  assetSymbols: string[];
  size?: number;
  css?: CssStyles;
}

export declare const AssetsImage: React.ComponentType<AssetsImageProps>;
