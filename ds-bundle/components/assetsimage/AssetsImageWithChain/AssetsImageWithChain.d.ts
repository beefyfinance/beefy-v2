import * as React from 'react';

/**
 * AssetsImageWithChain — from beefy-v2@0.1.0.
 */
export interface AssetsImageWithChainProps {
  chainId?: "base" | "polygon" | "ethereum" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | (string & {}) /* +25 more */;
  assetSymbols: string[];
  size?: number;
  css?: CssStyles;
}

export declare const AssetsImageWithChain: React.ComponentType<AssetsImageWithChainProps>;
