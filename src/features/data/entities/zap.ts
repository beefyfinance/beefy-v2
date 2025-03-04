import type {
  AmmConfigBalancer,
  AmmConfigGamma,
  AmmConfigSolidly,
  AmmConfigUniswapV2,
  SwapAggregatorConfig,
  ZapConfig,
} from '../apis/config-types.ts';

export type ZapEntity = ZapConfig;
export type SwapAggregatorEntity = SwapAggregatorConfig;
export type AmmEntityUniswapV2 = AmmConfigUniswapV2;
export type AmmEntitySolidly = AmmConfigSolidly;
export type AmmEntityUniswapLike = AmmEntityUniswapV2 | AmmEntitySolidly;
export type AmmEntityGamma = AmmConfigGamma;
export type AmmEntityBalancer = AmmConfigBalancer;
export type AmmEntity = AmmEntityUniswapLike | AmmEntityGamma | AmmConfigBalancer;

export function isSolidlyAmm(amm: AmmEntity): amm is AmmEntitySolidly {
  return amm.type === 'solidly';
}

export function isUniswapV2Amm(amm: AmmEntity): amm is AmmEntityUniswapV2 {
  return amm.type === 'uniswap-v2';
}

export function isUniswapLikeAmm(amm: AmmEntity): amm is AmmEntityUniswapLike {
  return isSolidlyAmm(amm) || isUniswapV2Amm(amm);
}

export function isGammaAmm(amm: AmmEntity): amm is AmmEntityGamma {
  return amm.type === 'gamma';
}

export function isBalancerAmm(amm: AmmEntity): amm is AmmEntityBalancer {
  return amm.type === 'balancer';
}
