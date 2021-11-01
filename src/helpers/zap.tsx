import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { addressBook } from 'blockchain-addressbook';
import { config } from '../config/config';

const data = [];
for (let net in config) {
  data[net] = require('config/zap/' + net + '.js');
}

export const getEligibleZap = pool => {
  if (pool.assets.length !== 2) return undefined;

  const tokenA = addressBook[pool.network]?.tokens[pool.assets[0]];
  const tokenB = addressBook[pool.network]?.tokens[pool.assets[1]];
  if (!tokenA || !tokenB) return undefined;

  const zap = data[pool.network].zaps.find(zap => {
    return (
      pool.tokenAddress ===
      computePairAddress(zap.ammFactory, zap.ammPairInitHash, tokenA.address, tokenB.address)
    );
  });
  if (!zap) return undefined;

  return {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: [tokenA, tokenB],
  };
};

export const computePairAddress = (factoryAddress, pairInitHash, tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
    pairInitHash
  );
};

export const sortTokens = (tokenA, tokenB) => {
  if (tokenA === tokenB)
    throw new RangeError(`Zap: tokenA should not be equal to tokenB: ${tokenB}`);
  return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
};
