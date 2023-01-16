import { bluechipTokens } from '../../../helpers/utils';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';
import { selectChainById } from './chains';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectIsAddressBookLoaded } from './data-loader';
import { VaultEntity } from '../entities/vault';
import { createCachedSelector } from 're-reselect';
import { selectVaultById } from './vaults';

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
  const tokensByChainId = selectTokensByChainId(state, chainId);
  const token = tokensByChainId.byAddress[address.toLowerCase()];
  if (token === undefined) {
    throw new Error(`selectTokenByAddress: Unknown token address`);
  }
  return token;
};

export const selectTokenByAddressOrNull = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: TokenEntity['address']
) => state.entities.tokens.byChainId[chainId]?.byAddress[address.toLowerCase()] || null;

export const selectTokensByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const tokensByChainId = state.entities.tokens.byChainId[chainId];
  if (tokensByChainId === undefined) {
    throw new Error(`selectTokensByChainId: Unknown chain id`);
  }
  return tokensByChainId;
};

export const selectDepositTokenByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
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

export const selectIsTokenStable = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) =>
    selectChainById(state, chainId),
  (state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId,
  (chain, tokenId) => chain.stableCoins.includes(tokenId)
)((state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId);

export const selectIsBeefyToken = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return ['BIFI', 'POTS', 'beFTM', 'beQI', 'beJOE', 'binSPIRIT', 'beVELO', 'beOPX'].includes(
    tokenId
  );
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
  return selectTokenPriceByTokenOracleId(state, token.oracleId);
};

export const selectTokenPriceByTokenOracleId = createCachedSelector(
  (state: BeefyState, oracleId: TokenEntity['oracleId']) =>
    state.entities.tokens.prices.byOracleId[oracleId],
  price => price || BIG_ZERO
)((state: BeefyState, oracleId: TokenEntity['oracleId']) => oracleId);

export const selectLpBreakdownByOracleId = (state: BeefyState, oracleId: TokenEntity['oracleId']) =>
  state.entities.tokens.breakdown.byOracleId[oracleId];

export const selectLpBreakdownByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string
) => {
  const token = selectTokenByAddress(state, chainId, address);
  return selectLpBreakdownByOracleId(state, token.oracleId);
};

export const selectHasBreakdownData = (
  state: BeefyState,
  depositTokenAddress: VaultEntity['depositTokenAddress'],
  chainId: ChainEntity['id']
) => {
  const isPricesLoaded = state.ui.dataLoader.global.prices.alreadyLoadedOnce;
  const isAddressBookLoaded = selectIsAddressBookLoaded(state, chainId);
  const token = selectTokenByAddressOrNull(state, chainId, depositTokenAddress);
  if (!token) return false;
  const breakdown = selectLpBreakdownByOracleId(state, token.oracleId);

  if (
    !isPricesLoaded ||
    !isAddressBookLoaded ||
    !breakdown ||
    !breakdown.tokens ||
    !breakdown.tokens.length ||
    !breakdown.balances ||
    breakdown.balances.length !== breakdown.tokens.length
  ) {
    return false;
  }

  // Must have tokens in state
  const tokens = breakdown.tokens.map(
    address => state.entities.tokens.byChainId[chainId].byAddress[address.toLowerCase()]
  );
  if (tokens.findIndex(token => !token) !== -1) {
    return false;
  }

  // Must have prices of tokens in state
  return tokens.findIndex(token => !state.entities.tokens.prices.byOracleId[token.oracleId]) === -1;
};
