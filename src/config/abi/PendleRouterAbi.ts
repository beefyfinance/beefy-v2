import type { Abi } from 'viem';

/**
 * Minimal ABI for Pendle Router V4 (PendleRouterV4, canonical address
 * 0x888888888889758F76e7103c6CbF23ABbF58F946 on every chain).
 *
 * Only the single-token add/remove liquidity actions are included — these are
 * what the Beefy zap uses to mint / redeem the market LP token.
 *
 * Struct shapes (from @pendle/core-v2 IPAllActionTypeV3 / IPLimitRouter):
 * - ApproxParams    = (guessMin, guessMax, guessOffchain, maxIteration, eps)
 * - SwapData        = (swapType, extRouter, extCalldata, needScale)
 * - TokenInput      = (tokenIn, netTokenIn, tokenMintSy, pendleSwap, swapData)
 * - TokenOutput     = (tokenOut, minTokenOut, tokenRedeemSy, pendleSwap, swapData)
 * - LimitOrderData  = (limitRouter, epsSkipMarket, normalFills[], flashFills[], optData)
 *
 * Verified on-chain selectors:
 * - addLiquiditySingleToken    => 0x12599ac6
 * - removeLiquiditySingleToken => 0x60da0860
 */

const approxParams = {
  components: [
    { internalType: 'uint256', name: 'guessMin', type: 'uint256' },
    { internalType: 'uint256', name: 'guessMax', type: 'uint256' },
    { internalType: 'uint256', name: 'guessOffchain', type: 'uint256' },
    { internalType: 'uint256', name: 'maxIteration', type: 'uint256' },
    { internalType: 'uint256', name: 'eps', type: 'uint256' },
  ],
  internalType: 'struct ApproxParams',
  name: 'guessPtReceivedFromSy',
  type: 'tuple',
} as const;

const swapDataComponents = [
  { internalType: 'uint8', name: 'swapType', type: 'uint8' },
  { internalType: 'address', name: 'extRouter', type: 'address' },
  { internalType: 'bytes', name: 'extCalldata', type: 'bytes' },
  { internalType: 'bool', name: 'needScale', type: 'bool' },
] as const;

const tokenInput = {
  components: [
    { internalType: 'address', name: 'tokenIn', type: 'address' },
    { internalType: 'uint256', name: 'netTokenIn', type: 'uint256' },
    { internalType: 'address', name: 'tokenMintSy', type: 'address' },
    { internalType: 'address', name: 'pendleSwap', type: 'address' },
    {
      components: swapDataComponents,
      internalType: 'struct SwapData',
      name: 'swapData',
      type: 'tuple',
    },
  ],
  internalType: 'struct TokenInput',
  name: 'input',
  type: 'tuple',
} as const;

const tokenOutput = {
  components: [
    { internalType: 'address', name: 'tokenOut', type: 'address' },
    { internalType: 'uint256', name: 'minTokenOut', type: 'uint256' },
    { internalType: 'address', name: 'tokenRedeemSy', type: 'address' },
    { internalType: 'address', name: 'pendleSwap', type: 'address' },
    {
      components: swapDataComponents,
      internalType: 'struct SwapData',
      name: 'swapData',
      type: 'tuple',
    },
  ],
  internalType: 'struct TokenOutput',
  name: 'output',
  type: 'tuple',
} as const;

const fillOrderParamsComponents = [
  {
    components: [
      { internalType: 'uint256', name: 'salt', type: 'uint256' },
      { internalType: 'uint256', name: 'expiry', type: 'uint256' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'uint8', name: 'orderType', type: 'uint8' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'YT', type: 'address' },
      { internalType: 'address', name: 'maker', type: 'address' },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'lnImpliedRate', type: 'uint256' },
      { internalType: 'uint256', name: 'failSafeRate', type: 'uint256' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    internalType: 'struct Order',
    name: 'order',
    type: 'tuple',
  },
  { internalType: 'bytes', name: 'signature', type: 'bytes' },
  { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
] as const;

const limitOrderData = {
  components: [
    { internalType: 'address', name: 'limitRouter', type: 'address' },
    { internalType: 'uint256', name: 'epsSkipMarket', type: 'uint256' },
    {
      components: fillOrderParamsComponents,
      internalType: 'struct FillOrderParams[]',
      name: 'normalFills',
      type: 'tuple[]',
    },
    {
      components: fillOrderParamsComponents,
      internalType: 'struct FillOrderParams[]',
      name: 'flashFills',
      type: 'tuple[]',
    },
    { internalType: 'bytes', name: 'optData', type: 'bytes' },
  ],
  internalType: 'struct LimitOrderData',
  name: 'limit',
  type: 'tuple',
} as const;

export const PendleRouterAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'minLpOut', type: 'uint256' },
      approxParams,
      tokenInput,
      limitOrderData,
    ],
    name: 'addLiquiditySingleToken',
    outputs: [
      { internalType: 'uint256', name: 'netLpOut', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyFee', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyInterm', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'netLpToRemove', type: 'uint256' },
      tokenOutput,
      limitOrderData,
    ],
    name: 'removeLiquiditySingleToken',
    outputs: [
      { internalType: 'uint256', name: 'netTokenOut', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyFee', type: 'uint256' },
      { internalType: 'uint256', name: 'netSyInterm', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;
