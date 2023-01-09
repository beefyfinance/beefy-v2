import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { sortTokenAddresses } from './tokens';

export function computeSolidlyPairAddress(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string,
  isStable: boolean
) {
  const [token0, token1] = sortTokenAddresses([tokenA, tokenB]);

  try {
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address', 'bool'], [token0, token1, isStable])]),
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

export function isStablePair(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string,
  tokenLP: string
): boolean {
  return (
    computeSolidlyPairAddress(
      factoryAddress,
      pairInitHash,
      tokenA.toLowerCase(),
      tokenB.toLowerCase(),
      true
    ).toLowerCase() === tokenLP.toLowerCase()
  );
}
