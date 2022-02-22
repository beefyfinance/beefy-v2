import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchAllPricesAction } from '../actions/prices';
import { fetchAllVaults } from '../actions/vaults';
import { BoostConfig, VaultConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20, TokenEntity } from '../entities/token';

/**
 * State containing Vault infos
 */
export type TokensState = {
  // we need to split by chain because tokens from different chains have the same ids
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byId: {
        [id: string]: TokenEntity;
      };
      allIds: string[];
    };
  };
  prices: {
    byTokenId: {
      [tokenId: TokenEntity['id']]: BigNumber;
    };
  };
};
export const initialTokensState: TokensState = { byChainId: {}, prices: { byTokenId: {} } };

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const [chainId, vaults] of Object.entries(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, chainId, vault);
        }
      }
    });

    // when boost list is fetched, add all new tokens
    builder.addCase(fetchAllBoosts.fulfilled, (sliceState, action) => {
      for (const [chainId, boosts] of Object.entries(action.payload)) {
        for (const boost of boosts) {
          addBoostToState(sliceState, chainId, boost);
        }
      }
    });

    // when prices are changed, update prices
    // this could also just be a a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchAllPricesAction.fulfilled, (sliceState, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (sliceState.prices.byTokenId[tokenId] === undefined) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (sliceState.prices.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });
  },
});

function addBoostToState(
  sliceState: WritableDraft<TokensState>,
  chainId: ChainEntity['id'],
  apiBoost: BoostConfig
) {
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = { byId: {}, allIds: [] };
  }

  let tokenId = apiBoost.earnedToken;

  /**
   * Fix case for some tokens like "Charge" and "CHARGE"
   * Only fix when values are different
   */
  if (
    !tokenId.startsWith('moo') &&
    !tokenId.includes('-') &&
    !tokenId.includes('_') &&
    !tokenId.includes('.') &&
    !tokenId.includes(' ') &&
    apiBoost.earnedToken !== apiBoost.earnedOracleId &&
    apiBoost.earnedToken.toLocaleUpperCase() === apiBoost.earnedOracleId.toLocaleUpperCase()
  ) {
    tokenId = apiBoost.earnedToken.toLocaleUpperCase();
  }

  if (sliceState.byChainId[chainId].byId[tokenId] === undefined) {
    const token: TokenEntity = {
      id: tokenId,
      chainId: chainId,
      contractAddress: apiBoost.earnedTokenAddress,
      decimals: apiBoost.earnedTokenDecimals,
      symbol: apiBoost.earnedToken,
      buyUrl: null,
      description: null,
      website: null,
      type: 'erc20',
    };
    temporaryWrappedtokenFix(token);
    sliceState.byChainId[chainId].byId[token.id] = token;
    sliceState.byChainId[chainId].allIds.push(token.id);
  }
}

function addVaultToState(
  sliceState: WritableDraft<TokensState>,
  chainId: ChainEntity['id'],
  vault: VaultConfig
) {
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = { byId: {}, allIds: [] };
  }

  if (sliceState.byChainId[chainId].byId[vault.oracleId] === undefined) {
    const token: TokenEntity = {
      id: vault.oracleId,
      chainId: chainId,
      contractAddress: vault.tokenAddress,
      decimals: vault.tokenDecimals,
      symbol: vault.token,
      buyUrl: null,
      description: null,
      website: null,
      type: 'erc20',
    };
    temporaryWrappedtokenFix(token);
    sliceState.byChainId[chainId].byId[token.id] = token;
    sliceState.byChainId[chainId].allIds.push(token.id);
  }

  // add earned token data
  const earnedTokenId = vault.earnedToken;
  if (sliceState.byChainId[chainId].byId[earnedTokenId] === undefined) {
    // gov vaults yield native tokens
    if (vault.isGovVault) {
      const token: TokenEntity = {
        id: earnedTokenId,
        chainId: chainId,
        decimals: 18, // TODO: not sure about that
        symbol: vault.earnedToken,
        buyUrl: null,
        type: 'native',
      };
      temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token;
      sliceState.byChainId[chainId].allIds.push(token.id);
    } else {
      const token: TokenEntity = {
        id: earnedTokenId,
        chainId: chainId,
        contractAddress: vault.earnedTokenAddress,
        decimals: 18, // TODO: not sure about that
        symbol: vault.earnedToken,
        buyUrl: null,
        description: null,
        website: null,
        type: 'erc20',
      };
      temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token;
      sliceState.byChainId[chainId].allIds.push(token.id);
    }
  }
}

const wrappedTokenFixes = [
  {
    chainId: 'fantom',
    tokenId: 'WFTM',
    contractAddress: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  },
  {
    chainId: 'polygon',
    tokenId: 'WMATIC',
    contractAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
];

/**
 * Some Wrapped tokens do not have a contractAddress set
 * This is a temporary fix
 */
function temporaryWrappedtokenFix(token: TokenEntity) {
  // only concern erc20 assets
  if (!isTokenErc20(token)) {
    return;
  }
  // contract address has been set
  if (token.contractAddress) {
    return;
  }

  // not a wrapped token
  if (!token.id.startsWith('W')) {
    console.error(`Erc20 token without a contract address: ${token.id} (${token.chainId})`);
    return;
  }

  for (const fix of wrappedTokenFixes) {
    if (token.chainId === fix.chainId && token.id === fix.tokenId) {
      token.contractAddress = fix.contractAddress;
      console.warn(`Fixed ${token.id} (${token.chainId}) contract address: ${fix.contractAddress}`);
      return;
    }
  }
  console.error(`Unfixed wrapped token without a contract address: ${token.id} (${token.chainId})`);
}
