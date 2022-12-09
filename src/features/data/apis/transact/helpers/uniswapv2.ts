import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { sortTokenAddresses } from './tokens';

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
