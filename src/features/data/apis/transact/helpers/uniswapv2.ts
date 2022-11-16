import { BigNumber } from 'bignumber.js';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { sortTokenAddresses } from './tokens';

export type LiquidityAmounts = {
  amount0: BigNumber;
  amount1: BigNumber;
};

/**
 * Optimal amounts of token0 and token1 to maintain reserve ratio
 * @see PancakeRouter._addLiquidity
 */
export function getOptimalAddLiquidityAmounts(
  amount0: BigNumber,
  amount1: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber
): LiquidityAmounts {
  if (reserve0.eq(BIG_ZERO) && reserve1.eq(BIG_ZERO)) {
    return { amount0, amount1 };
  }

  const amount1optimal = quote(amount0, reserve0, reserve1);
  if (amount1optimal.lte(amount1)) {
    return {
      amount0: amount0,
      amount1: amount1optimal,
    };
  }

  const amount0optimal = quote(amount1, reserve1, reserve0);
  return {
    amount0: amount0optimal,
    amount1: amount1,
  };
}

/**
 * Simple quote excluding swap fees
 * @see PancakeLibrary.quote
 */
export function quote(amount0: BigNumber, reserve0: BigNumber, reserve1: BigNumber) {
  if (amount0.lte(BIG_ZERO)) {
    throw new Error('Insufficient amount');
  }

  if (reserve0.lte(BIG_ZERO) || reserve1.lte(BIG_ZERO)) {
    throw new Error('Insufficient liquidity');
  }

  return amount0.multipliedBy(reserve1).dividedToIntegerBy(reserve0);
}

/**
 * Estimate how many LP tokens will be minted
 * Will always be wrong for LPs with mint fee (fee on mint changes totalSupply)
 * @see PancakePair.mint
 */
export function quoteMint(
  amount0: BigNumber,
  amount1: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
  totalSupply: BigNumber
): BigNumber {
  const MINIMUM_LIQUIDITY = new BigNumber('1000');

  if (totalSupply.eq(BIG_ZERO)) {
    return amount0.multipliedBy(amount1).squareRoot().decimalPlaces(0).minus(MINIMUM_LIQUIDITY);
  }

  return BigNumber.min(
    amount0.multipliedBy(totalSupply).dividedToIntegerBy(reserve0),
    amount1.multipliedBy(totalSupply).dividedToIntegerBy(reserve1)
  );
}

export function computeUniswapV2PairAddress(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string
) {
  const [token0, token1] = sortTokenAddresses([tokenA, tokenB]);

  try {
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
      pairInitHash
    );
  } catch (error) {
    // Failing silently causes zap options to not appear rather than deposit/withdraw to not be available at all
    console.error('getCreate2Address failed', {
      error,
      factoryAddress,
      pairInitHash,
      token0,
      token1,
    });
    return null;
  }
}
