import type {
  AmmConfigSolidly,
  AmmConfigUniswapV2,
  SwapAggregatorConfig,
  ZapConfig,
} from '../apis/config-types';

export type ZapEntity = ZapConfig;
export type SwapAggregatorEntity = SwapAggregatorConfig;
export type AmmEntityUniswapV2 = AmmConfigUniswapV2;
export type AmmEntitySolidly = AmmConfigSolidly;
export type AmmEntity = AmmEntityUniswapV2 | AmmEntitySolidly;

export function isSolidlyAmm(amm: AmmEntity): amm is AmmEntitySolidly {
  return amm.type === 'solidly';
}

export function isUniswapV2Amm(amm: AmmEntity): amm is AmmEntityUniswapV2 {
  return amm.type === 'uniswap-v2';
}
