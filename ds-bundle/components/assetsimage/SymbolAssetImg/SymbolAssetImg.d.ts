import * as React from 'react';

/**
 * SymbolAssetImg — from beefy-v2@0.1.0.
 */
export interface SymbolAssetImgProps {
  symbol: string;
  chainId?: "base" | "polygon" | "ethereum" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | (string & {}) /* +25 more */;
  className?: string;
}

export declare const SymbolAssetImg: React.ComponentType<SymbolAssetImgProps>;
