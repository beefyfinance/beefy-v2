import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { BeefyState } from '../../../redux-types';
import { isTokenErc20 } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { selectTokenById } from './tokens';
import { selectVaultById } from './vaults';

export const selectVaultEligibleZap = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);

  // no zap if this is not a 2 assets lp vault
  if (vault.assetIds.length !== 2) {
    return null;
  }
  const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
  const tokenA = selectTokenById(state, vault.chainId, vault.assetIds[0]);
  const tokenB = selectTokenById(state, vault.chainId, vault.assetIds[1]);

  if (!isTokenErc20(tokenA) || !isTokenErc20(tokenB) || !isTokenErc20(oracleToken)) {
    return null;
  }

  const chainZaps = state.entities.zaps.byChainId[vault.chainId];
  // zaps are not loaded yet
  if (!chainZaps) {
    return null;
  }

  const zap = chainZaps.find(zap => {
    return (
      oracleToken.contractAddress ===
      computePairAddress(
        zap.ammFactory,
        zap.ammPairInitHash,
        tokenA.contractAddress,
        tokenB.contractAddress
      )
    );
  });
  // zap does not exist for this pair
  if (!zap) {
    return null;
  }

  let zapOptions = [tokenA, tokenB];
  /*
  const wrappedToken = [tokenA, tokenB].find(
    t => t.contractAddress === addressBook[pool.network].tokens.WNATIVE.address
  );
  if (wrappedToken) {
    wrappedToken.isWrapped = true;
    zapOptions = [
      ...zapOptions,
      {
        ...wrappedToken,
        symbol: config[pool.network].walletSettings.nativeCurrency.symbol,
        isNative: true,
        isWrapped: false,
      },
    ];
  }
*/
  return {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: zapOptions,
  };
};

export const computePairAddress = (
  factoryAddress: string,
  pairInitHash: string,
  tokenAAddress: string,
  tokenBAddress: string
) => {
  const [token0, token1] = sortTokens(tokenAAddress, tokenBAddress);
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
