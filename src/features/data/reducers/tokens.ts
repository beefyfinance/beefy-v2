import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WritableDraft } from 'immer/dist/internal';
import { BeefyState } from '../../../redux-types';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllPricesAction } from '../actions/prices';
import {
  fetchAddressBookAction,
  FetchAddressBookPayload,
  fetchAllAddressBookAction,
} from '../actions/tokens';
import { fetchAllVaults } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import {
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../entities/token';
import { selectChainById } from '../selectors/chains';
import {
  getBoostTokenAddressFromLegacyConfig,
  getDepositTokenFromLegacyVaultConfig,
} from '../utils/config-hacks';
import { fetchAllMinters } from '../actions/minters';
import { BoostConfig, MinterConfig, VaultConfig } from '../apis/config-types';

/**
 * State containing Vault infos
 */
export type TokensState = {
  // we need to split by chain because tokens from different chains have the same ids
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byId: {
        [id: string]: TokenEntity['address'];
      };
      byAddress: {
        [address: string]: TokenEntity;
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
      interestingBalanceTokenAddresses: TokenEntity['address'][];
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
            byAddress: {},
            interestingBalanceTokenAddresses: [],
            native: null,
            wnative: null,
          };
        }

        const tokenId = chainConf.walletSettings.nativeCurrency.symbol;
        const token: TokenNative = {
          id: tokenId,
          chainId: chainId,
          oracleId: tokenId,
          decimals: chainConf.walletSettings.nativeCurrency.decimals, // TODO: not sure about that
          address: 'native',
          symbol: chainConf.walletSettings.nativeCurrency.symbol,
          type: 'native',
          buyUrl: sliceState.byChainId[chainId].byAddress['native']?.buyUrl ?? null,
          website: sliceState.byChainId[chainId].byAddress['native']?.website ?? null,
          description: sliceState.byChainId[chainId].byAddress['native']?.description ?? null,
        };
        sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
        sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
        sliceState.byChainId[chainId].native = token.id;
        sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
      }
    });

    // when vault list is fetched, add all new tokens
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const [chainId, vaults] of Object.entries(action.payload.byChainId)) {
        const chain = selectChainById(action.payload.state, chainId);
        for (const vault of vaults) {
          addVaultToState(action.payload.state, sliceState, chain, vault);
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

    // when minter list is fetched, add all new tokens
    builder.addCase(fetchAllMinters.fulfilled, (sliceState, action) => {
      for (const [chainId, minters] of Object.entries(action.payload.byChainId)) {
        for (const minter of minters) {
          addMinterToState(sliceState, chainId, minter);
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
      addAddressBookToState(sliceState, action.payload);
    });
    builder.addCase(fetchAllAddressBookAction.fulfilled, (sliceState, action) => {
      for (const payload of action.payload) {
        addAddressBookToState(sliceState, payload);
      }
    });
  },
});

function addAddressBookToState(
  sliceState: WritableDraft<TokensState>,
  addressBookPayload: FetchAddressBookPayload
) {
  const chainId = addressBookPayload.chainId;

  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      native: null,
      wnative: null,
    };
  }

  for (const [addressBookId, token] of Object.entries(addressBookPayload.addressBook)) {
    if (sliceState.byChainId[chainId].byId[token.id] === undefined) {
      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
    }

    if (sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] === undefined) {
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
    } else {
      const existingToken = sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()];
      existingToken.buyUrl = existingToken.buyUrl || token.buyUrl;
      existingToken.description = existingToken.description || token.description;
      existingToken.website = existingToken.website || token.website;
    }

    if (addressBookId === 'WNATIVE' && !sliceState.byChainId[chainId].wnative) {
      sliceState.byChainId[chainId].wnative = token.id;
    }

    // update the native token address for those chains who have one
    if (isTokenNative(token) && token.address !== 'native') {
      const chainNative = sliceState.byChainId[chainId].byAddress['native'] as TokenNative;
      if (chainNative && chainNative.address === null) {
        chainNative.address = token.address;
      }
    }
  }
}

function addBoostToState(
  sliceState: WritableDraft<TokensState>,
  chainId: ChainEntity['id'],
  apiBoost: BoostConfig
) {
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      native: null,
      wnative: null,
    };
  }

  const tokenAddress = getBoostTokenAddressFromLegacyConfig(apiBoost);
  if (sliceState.byChainId[chainId].byAddress[tokenAddress.toLowerCase()] === undefined) {
    const token: TokenEntity = {
      id: apiBoost.earnedToken,
      chainId: chainId,
      address: apiBoost.earnedTokenAddress,
      oracleId: apiBoost.earnedOracleId,
      decimals: apiBoost.earnedTokenDecimals,
      symbol: apiBoost.earnedToken,
      buyUrl: null,
      description: null,
      website: null,
      type: 'erc20',
    };
    temporaryWrappedtokenFix(token);
    sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
    sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
    sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
  }
}

function addMinterToState(
  sliceState: WritableDraft<TokensState>,
  chainId: ChainEntity['id'],
  apiMinter: MinterConfig
) {
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      native: null,
      wnative: null,
    };
  }

  for (const sourceToken of [apiMinter.depositToken, apiMinter.mintedToken]) {
    if (
      sliceState.byChainId[chainId].byAddress[sourceToken.contractAddress.toLowerCase()] ===
      undefined
    ) {
      const token: TokenEntity =
        sourceToken.type === 'erc20'
          ? {
              id: sourceToken.symbol,
              symbol: sourceToken.symbol,
              chainId: chainId,
              oracleId: sourceToken.oracleId,
              address: sourceToken.contractAddress,
              decimals: sourceToken.decimals,
              buyUrl: null,
              type: 'erc20',
              description: null,
              website: null,
            }
          : {
              id: sourceToken.symbol,
              symbol: sourceToken.symbol,
              chainId: chainId,
              oracleId: sourceToken.oracleId,
              address: 'native',
              decimals: sourceToken.decimals,
              buyUrl: null,
              type: 'native',
              website: null,
              description: null,
            };

      temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
    }
  }
}

function addVaultToState(
  state: BeefyState,
  sliceState: WritableDraft<TokensState>,
  chain: ChainEntity,
  vault: VaultConfig
) {
  const chainId = chain.id;
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      native: null,
      wnative: null,
    };
  }

  const depositToken = getDepositTokenFromLegacyVaultConfig(selectChainById(state, chainId), vault);
  if (sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()] === undefined) {
    sliceState.byChainId[chainId].byId[depositToken.id] = depositToken.address.toLowerCase();
    sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(depositToken.address);
    sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()] = depositToken;
  }

  // add earned token data
  const addressKey = vault.earnedTokenAddress ? vault.earnedTokenAddress.toLowerCase() : 'native';
  if (sliceState.byChainId[chainId].byAddress[addressKey] === undefined) {
    if (vault.isGovVault) {
      const addressKey =
        vault.earnedToken === sliceState.byChainId[chainId].native
          ? 'native'
          : vault.earnedTokenAddress.toLowerCase();

      const token: TokenEntity =
        vault.earnedToken === sliceState.byChainId[chainId].native
          ? {
              id: vault.earnedToken,
              chainId: chainId,
              oracleId: vault.earnedToken,
              address: 'native',
              decimals: chain.walletSettings.nativeCurrency.decimals,
              symbol: vault.earnedToken,
              type: 'native',
              buyUrl: sliceState.byChainId[chainId].byAddress[addressKey]?.buyUrl ?? null,
              website: sliceState.byChainId[chainId].byAddress[addressKey]?.website ?? null,
              description: sliceState.byChainId[chainId].byAddress[addressKey]?.description ?? null,
            }
          : {
              id: vault.earnedToken,
              chainId: chainId,
              oracleId: vault.oracleId,
              decimals: vault.earnedTokenDecimals ?? 18,
              address: vault.earnedTokenAddress,
              symbol: vault.earnedToken,
              type: 'erc20',
              buyUrl: sliceState.byChainId[chainId].byAddress[addressKey]?.buyUrl ?? null,
              website: sliceState.byChainId[chainId].byAddress[addressKey]?.website ?? null,
              description: sliceState.byChainId[chainId].byAddress[addressKey]?.description ?? null,
            };
      temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
    } else {
      const addressKey: string = vault.earnedTokenAddress.toLowerCase();
      const token: TokenEntity = {
        id: vault.earnedToken,
        chainId: chainId,
        oracleId: vault.oracleId,
        address: vault.earnedTokenAddress,
        decimals: 18, // TODO: not sure about that
        symbol: vault.earnedToken,
        buyUrl: sliceState.byChainId[chainId].byAddress[addressKey]?.buyUrl ?? null,
        website: sliceState.byChainId[chainId].byAddress[addressKey]?.website ?? null,
        description: sliceState.byChainId[chainId].byAddress[addressKey]?.description ?? null,
        type: 'erc20',
      };
      // temporaryWrappedtokenFix(token);
      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
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
  if (token.address) {
    return;
  }

  // not a wrapped token
  if (!token.id.startsWith('W')) {
    console.error(`Erc20 token without a contract address: ${token.id} (${token.chainId})`);
    return;
  }

  for (const fix of wrappedTokenFixes) {
    if (token.chainId === fix.chainId && token.id === fix.tokenId) {
      token.address = fix.contractAddress;
      console.warn(`Fixed ${token.id} (${token.chainId}) contract address: ${fix.contractAddress}`);
      return;
    }
  }
  console.error(`Unfixed wrapped token without a contract address: ${token.id} (${token.chainId})`);
}
