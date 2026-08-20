import * as React from 'react';

/**
 * ChainIcon — from beefy-v2@0.1.0.
 */
export interface ChainIconProps {
  chainId: "base" | "polygon" | "ethereum" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | (string & {}) /* +25 more */;
  css?: CssStyles;
  size?: number;
}

export declare const ChainIcon: React.ComponentType<ChainIconProps>;
