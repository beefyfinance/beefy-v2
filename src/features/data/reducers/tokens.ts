import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllPricesAction } from '../actions/prices';
import { fetchAddressBookAction } from '../actions/tokens';
import { fetchAllVaults } from '../actions/vaults';
import { BoostConfig, VaultConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import {
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../entities/token';

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
      native: TokenNative['id'];
      wnative: TokenErc20['id'];
      /**
       * we keep the list of tokens where we could be interested in fetching the balance of
       * it would be more correct to put those inside the balance reducer but this token
       * reducer has a number of config fixes that I find would make for a more complex code
       * if refactored. And we have to update the config anyway to make it smaller, so move this
       * inside the balance reducer once the config is reworked
       */
      interestingBalanceTokenIds: TokenEntity['id'][];
    };
  };
  prices: {
    byTokenId: {
      [tokenId: TokenEntity['id']]: BigNumber;
    };
  };
};
export const initialTokensState: TokensState = {
  byChainId: {},
  prices: { byTokenId: {} },
};

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // handle native token config
    builder.addCase(fetchChainConfigs.fulfilled, (sliceState, action) => {
      for (const chainConf of action.payload.chainConfigs) {
        const chainId = chainConf.id;

        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = {
            byId: {},
            interestingBalanceTokenIds: [],
            native: null,
            wnative: null,
          };
        }
        if (!sliceState.byChainId[chainId].native) {
          sliceState.byChainId[chainId].native = chainConf.walletSettings.nativeCurrency.symbol;
        }
      }
    });

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
        let tokenPrice = action.payload[tokenId];

        // when the api fails to fetch the token price, we say 1 token = $1
        if (tokenPrice === null || tokenPrice === undefined) {
          console.warn(`API returned an empty price for token ${tokenId}`);
          tokenPrice = 1.0;
        }

        // new price, add it
        if (sliceState.prices.byTokenId[tokenId] === undefined) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (sliceState.prices.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });

    // we have another way of finding token info
    builder.addCase(fetchAddressBookAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = {
          byId: {},
          interestingBalanceTokenIds: [],
          native: null,
          wnative: null,
        };
      }

      for (const [addressBookId, token] of Object.entries(action.payload.addressBook)) {
        if (sliceState.byChainId[chainId].byId[token.id] === undefined) {
          sliceState.byChainId[chainId].byId[token.id] = token;
        }
        if (isTokenNative(token) && !sliceState.byChainId[chainId].native) {
          sliceState.byChainId[chainId].native = token.id;
        }
        if (addressBookId === 'WNATIVE' && !sliceState.byChainId[chainId].wnative) {
          sliceState.byChainId[chainId].wnative = token.id;
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
    sliceState.byChainId[chainId] = {
      byId: {},
      interestingBalanceTokenIds: [],
      native: null,
      wnative: null,
    };
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
    sliceState.byChainId[chainId].interestingBalanceTokenIds.push(token.id);
  }
}

function addVaultToState(
  sliceState: WritableDraft<TokensState>,
  chainId: ChainEntity['id'],
  vault: VaultConfig
) {
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      interestingBalanceTokenIds: [],
      native: null,
      wnative: null,
    };
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
    sliceState.byChainId[chainId].interestingBalanceTokenIds.push(token.id);
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
        website: null,
        description: null,
      };
      temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token;
      sliceState.byChainId[chainId].interestingBalanceTokenIds.push(token.id);
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
      sliceState.byChainId[chainId].interestingBalanceTokenIds.push(token.id);
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
