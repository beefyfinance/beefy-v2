import { bluechipTokens } from '../../../helpers/utils';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';
import { selectChainById } from './chains';
import { BIG_ONE } from '../../../helpers/big-number';

export const selectIsTokenLoaded = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  return byChainId[chainId].byId[tokenId] !== undefined;
};

export const selectTokenById = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  if (byChainId[chainId].byId[tokenId] === undefined) {
    // fallback to addressbook token
    throw new Error(
      `selectTokenById: Unknown token id ${tokenId} for chain ${chainId}, maybe you need to load the addressbook`
    );
  }
  const address = byChainId[chainId].byId[tokenId];
  return byChainId[chainId].byAddress[address];
};

export const selectTokenByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: TokenEntity['address']
) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  if (byChainId[chainId].byAddress[address.toLowerCase()] === undefined) {
    // fallback to addressbook token
    throw new Error(
      `selectTokenByAddress: Unknown token address ${address} for chain ${chainId}, maybe you need to load the addressbook`
    );
  }
  return byChainId[chainId].byAddress[address.toLowerCase()];
};

export const selectErc20TokenByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string,
  mapNativeToWnative: boolean = false
) => {
  const token = selectTokenByAddress(state, chainId, address);
  // type narrowing
  if (!isTokenErc20(token)) {
    if (mapNativeToWnative) {
      return selectChainWrappedNativeToken(state, chainId);
    } else {
      throw new Error(
        `selectErc20TokenByAddress: Input token ${address} is native. set mapNativeToWnative = true to automatically fetch wrapped token if needed`
      );
    }
  }
  return token;
};

export const selectChainNativeToken = (state: BeefyState, chainId: ChainEntity['id']) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectChainNativeToken: Unknown chain id ${chainId}`);
  }
  if (!byChainId[chainId].native) {
    // fallback to addressbook token
    throw new Error(
      `selectChainNativeToken: Empty native token for chain id ${chainId}, maybe you need to load the addressbook`
    );
  }
  const token = selectTokenById(state, chainId, byChainId[chainId].native);
  // type narrowing
  if (!isTokenNative(token)) {
    throw new Error(
      `selectChainNativeToken: Fetch a native token when getting native of chain ${chainId}`
    );
  }
  return token;
};

export const selectChainWrappedNativeToken = (state: BeefyState, chainId: ChainEntity['id']) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectChainWrappedNativeToken: Unknown chain id ${chainId}`);
  }
  if (!byChainId[chainId].wnative) {
    // fallback to addressbook token
    throw new Error(
      `selectChainWrappedNativeToken: Empty wnative token for chain id ${chainId}, maybe you need to load the addressbook`
    );
  }
  const token = selectTokenById(state, chainId, byChainId[chainId].wnative);
  // type narrowing
  if (!isTokenErc20(token)) {
    throw new Error(
      `selectChainWrappedNativeToken: Fetch a wnative token when getting native of chain ${chainId}`
    );
  }
  return token;
};

export const selectIsTokenStable = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const chain = selectChainById(state, chainId);
  return chain.stableCoins.includes(tokenId);
};

export const selectIsBeefyToken = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return ['BIFI', 'POTS', 'beFTM', 'beQI', 'beJOE', 'binSPIRIT'].includes(tokenId);
};

export const selectIsTokenBluechip = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return bluechipTokens.includes(tokenId);
};

export const selectTokenPriceByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string
) => {
  const token = state.entities.tokens.byChainId[chainId].byAddress[address.toLowerCase()];
  return state.entities.tokens.prices.byOracleId[token.oracleId] || BIG_ONE;
};

export const selectTokenPriceByTokenOracleId = (
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) => state.entities.tokens.prices.byOracleId[oracleId] || BIG_ONE;

export const selectLpBreakdownByOracleId = (
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) => {
  return state.entities.tokens.breakdown.byOracleId[oracleId];
};
export const selectLpBreakdownByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string
) => {
  const token = selectTokenByAddress(state, chainId, address);
  return selectLpBreakdownByOracleId(state, token.oracleId);
};
