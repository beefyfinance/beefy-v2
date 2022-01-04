import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { addressBook as _addressBook } from 'blockchain-addressbook';
import { config } from '../config/config';

//allow the Harmony-blockchain entries in the address-book to be accessed via the normal
//  "network" property values used in our core vault-object schema
const addressBook = { ..._addressBook, harmony: _addressBook.one };

const data = [];
for (let net in config) {
  data[net] = require(`../config/zap/${net}`);
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

  const zapOptions = [tokenA, tokenB];

  const wrappedToken = [tokenA, tokenB].find(
    t => t.address === addressBook[pool.network].tokens.WNATIVE.address
  );
  if (wrappedToken) {
    wrappedToken.isWrapped = true;
    zapOptions.unshift({
      ...wrappedToken,
      symbol: config[pool.network].walletSettings.nativeCurrency.symbol,
      isNative: true,
      isWrapped: false,
    });
  }

  return {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: zapOptions,
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
