import { AmmConfigSolidly, AmmConfigUniswapV2 } from '../apis/config-types';

export type AmmEntityUniswapV2 = AmmConfigUniswapV2;
export type AmmEntitySolidly = AmmConfigSolidly;
export type AmmEntity = AmmEntityUniswapV2 | AmmEntitySolidly;

export function isSolidlyAmm(amm: AmmEntity): amm is AmmEntitySolidly {
  return amm.type === 'solidly';
}

export function isUniswapV2Amm(amm: AmmEntity): amm is AmmEntityUniswapV2 {
  return amm.type === 'uniswapv2';
}
