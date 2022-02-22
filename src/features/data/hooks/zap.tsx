import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { BeefyState } from '../../../redux-types';
import { isTokenErc20 } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenById } from '../selectors/tokens';
import { selectChainById } from '../selectors/chains';
import { useSelector } from 'react-redux';
import { useTokenAddressbookData } from './addressbook';

export const useVaultEligibleZap = (vaultId: VaultEntity['id']) => {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );
  const [loadingA, tokenA] = useTokenAddressbookData(vault.chainId, vault.assetIds[0]);
  const [loadingB, tokenB] = useTokenAddressbookData(vault.chainId, vault.assetIds[1]);
  const [loadingWNative, tokenWNative] = useTokenAddressbookData(vault.chainId, 'WNATIVE');
  const chainZaps = useSelector(
    (state: BeefyState) => state.entities.zaps.byChainId[vault.chainId]
  );

  // still loading data
  if (loadingA || loadingB || loadingWNative || !tokenA || !tokenB || !tokenWNative) {
    return null;
  }

  // no zap if this is not a 2 assets lp vault
  if (vault.assetIds.length !== 2) {
    return null;
  }
  // type narrowing
  if (!isTokenErc20(oracleToken)) {
    return null;
  }

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

  const wrappedToken = [tokenA, tokenB].find(
    t => t.contractAddress === tokenWNative.contractAddress
  );
  if (wrappedToken) {
    // @ts-ignore
    wrappedToken.isWrapped = true;
    zapOptions = [
      ...zapOptions,
      {
        ...wrappedToken,
        symbol: chain.walletSettings.nativeCurrency.symbol,
        // @ts-ignore
        isNative: true,
        isWrapped: false,
      },
    ];
  }
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
