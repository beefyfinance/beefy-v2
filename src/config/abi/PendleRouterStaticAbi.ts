import type { Abi } from 'viem';

/**
 * Minimal ABI for Pendle's Router Static helper (PendleRouterStatic) used purely
 * for off-chain quoting via eth_call — it mirrors the router actions as view
 * functions so we can estimate LP out / token out without the SDK.
 *
 * Mainnet address: 0x263833d47eA3fA4a30f269323aba6a107f9eB14C
 *
 * Only the first return value of each function is used by the zap
 * (netLpOut / netTokenOut); the remaining values are kept for correct decoding.
 */
export const PendleRouterStaticAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'address', name: 'tokenIn', type: 'address' },
      { internalType: 'uint256', name: 'netTokenIn', type: 'uint256' },
    ],
    name: 'addLiquiditySingleTokenStatic',
    outputs: [
      { internalType: 'uint256', name: 'netLpOut', type: 'uint256' },
      { internalType: 'uint256', name: 'netPtFromSwap', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyFee', type: 'uint256' },
      { internalType: 'uint256', name: 'priceImpact', type: 'uint256' },
      { internalType: 'uint256', name: 'exchangeRateAfter', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyMinted', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyToSwap', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'netLpToRemove', type: 'uint256' },
      { internalType: 'address', name: 'tokenOut', type: 'address' },
    ],
    name: 'removeLiquiditySingleTokenStatic',
    outputs: [
      { internalType: 'uint256', name: 'netTokenOut', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyFee', type: 'uint256' },
      { internalType: 'uint256', name: 'priceImpact', type: 'uint256' },
      { internalType: 'uint256', name: 'exchangeRateAfter', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;
