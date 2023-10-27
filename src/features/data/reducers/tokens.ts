import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import type { BeefyState } from '../../../redux-types';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllPricesAction } from '../actions/prices';
import type { FetchAddressBookPayload } from '../actions/tokens';
import { fetchAddressBookAction, fetchAllAddressBookAction } from '../actions/tokens';
import { fetchAllVaults } from '../actions/vaults';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenErc20, TokenLpBreakdown, TokenNative } from '../entities/token';
import { isTokenErc20, isTokenNative } from '../entities/token';
import { selectChainById } from '../selectors/chains';
import {
  getBoostTokenAddressFromLegacyConfig,
  getDepositTokenFromLegacyVaultConfig,
} from '../utils/config-hacks';
import { fetchAllMinters } from '../actions/minters';
import type { BoostConfig, MinterConfig, VaultConfig } from '../apis/config-types';
import type { LpData } from '../apis/beefy/beefy-api';
import { isNativeAlternativeAddress } from '../../../helpers/addresses';
import { fetchBridgeConfig } from '../actions/bridge';

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
    byOracleId: {
      [tokenId: TokenEntity['oracleId']]: BigNumber;
    };
  };
  breakdown: {
    byOracleId: {
      [tokenId: TokenEntity['oracleId']]: TokenLpBreakdown;
    };
  };
};
export const initialTokensState: TokensState = {
  byChainId: {},
  prices: { byOracleId: {} },
  breakdown: { byOracleId: {} },
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
          documentation: sliceState.byChainId[chainId].byAddress['native']?.documentation ?? null,
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
    // this could also just be a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchAllPricesAction.fulfilled, (sliceState, action) => {
      for (const [oracleId, price] of Object.entries(action.payload.prices)) {
        addPriceToState(sliceState, oracleId, price);
      }

      for (const [oracleId, breakdown] of Object.entries(action.payload.breakdowns)) {
        addPriceToState(sliceState, oracleId, breakdown.price);
        addBreakdownToState(sliceState, oracleId, breakdown);
      }
    });

    // tokens from addressbook
    builder.addCase(fetchAddressBookAction.fulfilled, (sliceState, action) => {
      addAddressBookToState(sliceState, action.payload);
    });

    builder.addCase(fetchAllAddressBookAction.fulfilled, (sliceState, action) => {
      for (const payload of action.payload) {
        addAddressBookToState(sliceState, payload);
      }
    });

    // tokens from beefy bridge
    builder.addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
      const {
        config: { source, tokens },
      } = action.payload;

      const sourceToken = addBridgeTokenToState(
        sliceState,
        {
          ...source,
          type: 'erc20',
          buyUrl: null,
          website: null,
          documentation: null,
          description: null,
        },
        true
      );

      for (const [chainId, address] of Object.entries(tokens)) {
        const isSourceXErc20 = chainId === sourceToken.chainId;

        const token: TokenErc20 = {
          ...sourceToken,
          id: isSourceXErc20 ? `x${sourceToken.id}` : sourceToken.id,
          chainId,
          address,
        };

        // no need to track xerc20 on source chain
        addBridgeTokenToState(sliceState, token, !isSourceXErc20);
      }
    });
  },
});

function addBridgeTokenToState(
  sliceState: Draft<TokensState>,
  token: TokenErc20,
  trackBalance: boolean
): TokenErc20 {
  const chainId = token.chainId;
  const addressLower = token.address.toLowerCase();

  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      native: null,
      wnative: null,
    };
  }

  // If it doesn't exist then, add it
  if (sliceState.byChainId[chainId].byAddress[addressLower] === undefined) {
    sliceState.byChainId[chainId].byAddress[addressLower] = token;
  }

  // id => address mapping
  if (sliceState.byChainId[chainId].byId[token.id] === undefined) {
    sliceState.byChainId[chainId].byId[token.id] = addressLower;
  }

  // grab existing/added token
  const stateToken = sliceState.byChainId[chainId].byAddress[addressLower];

  // ensure we track balance
  if (trackBalance) {
    ensureInterestingToken(addressLower, chainId, sliceState);
  }

  // type-safety
  if (isTokenErc20(stateToken)) {
    return stateToken;
  }

  throw new Error(`Existing token ${stateToken.id} is not an ERC20 token`);
}

function addPriceToState(
  sliceState: Draft<TokensState>,
  oracleId: string,
  price: number | undefined | null
) {
  // when the api fails to fetch the token price, we say 1 token = $1
  if (price === null || price === undefined) {
    console.warn(`API returned an empty price for oracle ${oracleId}`);
    price = 1.0;
  }

  if (sliceState.prices.byOracleId[oracleId] === undefined) {
    // new price, add it
    sliceState.prices.byOracleId[oracleId] = new BigNumber(price);
  } else if (!sliceState.prices.byOracleId[oracleId].isEqualTo(price)) {
    // price exists, update it if it changed
    sliceState.prices.byOracleId[oracleId] = new BigNumber(price);
  }
}

function addBreakdownToState(sliceState: Draft<TokensState>, oracleId: string, breakdown: LpData) {
  // Must have breakdown
  if (!('tokens' in breakdown) || !('balances' in breakdown)) {
    // console.warn(`[LP Breakdown] ${oracleId} missing breakdown`);
    return;
  }

  // Number of tokens must match number of balances
  if (breakdown.tokens.length !== breakdown.balances.length) {
    // console.warn(`[LP Breakdown] ${oracleId} number of tokens does not match number of balances`);
    return;
  }

  // All addresses should be valid
  if (breakdown.tokens.find(address => !address) !== undefined) {
    // console.warn(`[LP Breakdown] ${oracleId} has invalid token address`);
    return;
  }

  // All balances should be > 0
  if (breakdown.balances.find(balance => balance === '0') !== undefined) {
    // console.warn(`[LP Breakdown] ${oracleId} has zero balance`);
    return;
  }

  // Replace native stand-ins
  breakdown.tokens = breakdown.tokens.map(address =>
    isNativeAlternativeAddress(address) ? 'native' : address
  );

  // Add to state
  sliceState.breakdown.byOracleId[oracleId] = breakdown;
}

function addAddressBookToState(
  sliceState: Draft<TokensState>,
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
    if (isTokenNative(token)) {
      // native tokens are preloaded when chain configs load
      //Just load description missing data from local config
      const existingToken = sliceState.byChainId[chainId].byAddress['native'];
      existingToken.buyUrl = existingToken.buyUrl || token.buyUrl;
      existingToken.description = existingToken.description || token.description;
      existingToken.website = existingToken.website || token.website;
      continue;
    }

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
      if (isTokenErc20(existingToken)) {
        existingToken.bridge = existingToken.bridge || token.bridge;
      }
    }

    if (addressBookId === 'WNATIVE' && !sliceState.byChainId[chainId].wnative) {
      sliceState.byChainId[chainId].wnative = token.id;
    }
  }
}

function addBoostToState(
  sliceState: Draft<TokensState>,
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
      documentation: null,
    };
    sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
    sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
    sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
  }
}

function addMinterToState(
  sliceState: Draft<TokensState>,
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
              documentation: null,
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
              documentation: null,
            };

      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
    }
  }
}

function addVaultToState(
  state: BeefyState,
  sliceState: Draft<TokensState>,
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

  const depositToken = getDepositTokenFromLegacyVaultConfig(chain, vault);

  if (sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()] === undefined) {
    sliceState.byChainId[chainId].byId[depositToken.id] = depositToken.address.toLowerCase();
    sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(depositToken.address);
    sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()] = depositToken;
  } else {
    // Vault oracleId takes precedence over address book oracleId
    sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()].oracleId =
      depositToken.oracleId;
  }

  if (
    sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()].providerId ===
    undefined
  ) {
    sliceState.byChainId[chainId].byAddress[depositToken.address.toLowerCase()].providerId =
      depositToken.providerId;
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
              documentation:
                sliceState.byChainId[chainId].byAddress[addressKey]?.documentation ?? null,
            }
          : {
              id: vault.earnedToken,
              chainId: chainId,
              oracleId: vault.earnedToken,
              decimals: vault.earnedTokenDecimals ?? 18,
              address: vault.earnedTokenAddress,
              symbol: vault.earnedToken,
              type: 'erc20',
              buyUrl: sliceState.byChainId[chainId].byAddress[addressKey]?.buyUrl ?? null,
              website: sliceState.byChainId[chainId].byAddress[addressKey]?.website ?? null,
              description: sliceState.byChainId[chainId].byAddress[addressKey]?.description ?? null,
              documentation:
                sliceState.byChainId[chainId].byAddress[addressKey]?.documentation ?? null,
            };
      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;
    } else {
      // Add receipt token
      const addressKey: string = vault.earnedTokenAddress.toLowerCase();
      const token: TokenEntity = {
        id: vault.earnedToken,
        chainId: chainId,
        oracleId: vault.oracleId,
        address: vault.earnedTokenAddress,
        decimals: 18, // receipt token always has 18 decimals
        symbol: vault.earnedToken,
        buyUrl: sliceState.byChainId[chainId].byAddress[addressKey]?.buyUrl ?? null,
        website: sliceState.byChainId[chainId].byAddress[addressKey]?.website ?? null,
        description: sliceState.byChainId[chainId].byAddress[addressKey]?.description ?? null,
        documentation: sliceState.byChainId[chainId].byAddress[addressKey]?.documentation ?? null,
        type: 'erc20',
      };

      sliceState.byChainId[chainId].byId[token.id] = token.address.toLowerCase();
      sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(token.address);
      sliceState.byChainId[chainId].byAddress[token.address.toLowerCase()] = token;

      // Add bridged versions of receipt token
      if (vault.bridged) {
        addBridgedReceiptTokensToState(vault, token, vault.earnedToken, sliceState);
      }
    }
  } else {
    /** address book loaded first, and the vault receipt token is in the address book */
    // make sure vault token is still tagged as an interesting address
    ensureInterestingToken(vault.earnedTokenAddress ?? 'native', chainId, sliceState);
    // make sure bridged tokens are added/are marked as interesting
    if (!vault.isGovVault && vault.bridged) {
      const token = sliceState.byChainId[chainId].byAddress[addressKey];
      if (isTokenErc20(token)) {
        addBridgedReceiptTokensToState(vault, token, vault.earnedToken, sliceState);
      }
    }
  }
}

function addBridgedReceiptTokensToState(
  vault: VaultConfig,
  token: TokenErc20,
  oracleId: string,
  sliceState: Draft<TokensState>
) {
  if (!vault.bridged) {
    return;
  }

  const bridgedTokens = Object.entries(vault.bridged).map(([chainId, address]) => ({
    ...token,
    id: `${token.id}`,
    chainId,
    address,
    oracleId,
    description: token.description || null, // we leave description null so that addressbook can fill it in
  }));

  for (const bridgedToken of bridgedTokens) {
    const bridgedAddressKey = bridgedToken.address.toLowerCase();
    const existingBridgedToken =
      sliceState.byChainId[bridgedToken.chainId].byAddress[bridgedAddressKey];

    // Add bridged receipt token
    if (!existingBridgedToken) {
      sliceState.byChainId[bridgedToken.chainId].byId[bridgedToken.id] = bridgedAddressKey;
      sliceState.byChainId[bridgedToken.chainId].byAddress[bridgedAddressKey] = bridgedToken;
    }

    // Make sure bridged receipt token is marked as interesting
    ensureInterestingToken(bridgedToken.address, bridgedToken.chainId, sliceState);
  }
}

function ensureInterestingToken(
  address: string,
  chainId: ChainEntity['id'],
  sliceState: Draft<TokensState>
) {
  if (!sliceState.byChainId[chainId].interestingBalanceTokenAddresses.includes(address)) {
    sliceState.byChainId[chainId].interestingBalanceTokenAddresses.push(address);
  }
}
