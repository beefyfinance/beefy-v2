import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import { isNativeAlternativeAddress } from '../../../helpers/addresses.ts';
import { entries } from '../../../helpers/object.ts';
import { fetchBridgeConfig } from '../actions/bridge.ts';
import { fetchChainConfigs } from '../actions/chains.ts';
import { fetchAllMinters } from '../actions/minters.ts';
import { fetchAllPricesAction } from '../actions/prices.ts';
import { initPromos } from '../actions/promos.ts';
import type { FetchAddressBookPayload } from '../actions/tokens.ts';
import {
  fetchAddressBookAction,
  fetchAllAddressBookAction,
  fetchAllCurrentCowcentratedRanges,
} from '../actions/tokens.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import type { LpData } from '../apis/beefy/beefy-api-types.ts';
import type { MinterConfig, VaultConfig } from '../apis/config-types.ts';
import type { PromoTokenRewardConfig } from '../apis/promos/types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity, TokenErc20, TokenNative } from '../entities/token.ts';
import { isTokenErc20, isTokenNative } from '../entities/token.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../entities/vault.ts';
import { getDepositTokenFromLegacyVaultConfig } from '../utils/config-hacks.ts';
import type { TokensState } from './tokens-types.ts';

export const initialTokensState: TokensState = {
  byChainId: {},
  prices: { byOracleId: {} },
  breakdown: { byOracleId: {} },
  cowcentratedRanges: { byOracleId: {} },
};

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    addToken: (
      sliceState,
      action: PayloadAction<{ token: TokenEntity; interesting: boolean; override?: boolean }>
    ) => {
      const { token, interesting, override } = action.payload;
      if (override) {
        addTokenToState(sliceState, token, interesting);
      } else {
        addTokenToStateIfNotExists(sliceState, token, interesting);
      }
    },
  },
  extraReducers: builder => {
    // handle native token config
    builder.addCase(fetchChainConfigs.fulfilled, (sliceState, action) => {
      for (const chainConf of action.payload.chainConfigs) {
        const chainId = chainConf.id;
        const chainState = getOrCreateTokensChainState(sliceState, chainId);
        const existingNative = chainState.byAddress['native'];

        const token: TokenNative = {
          id: chainConf.native.symbol,
          chainId: chainId,
          oracleId: chainConf.native.oracleId,
          decimals: 18,
          address: 'native',
          symbol: chainConf.native.symbol,
          type: 'native',
          buyUrl: existingNative?.buyUrl ?? undefined,
          website: existingNative?.website ?? undefined,
          description: existingNative?.description ?? undefined,
          documentation: existingNative?.documentation ?? undefined,
        };

        addTokenToState(sliceState, token, true);
        chainState.native = token.id;
      }
    });

    // when vault list is fetched, add all new tokens
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const vaults of Object.values(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, vault.config, vault.entity);
        }
      }
    });

    // when promos list is fetched, add all new tokens
    builder.addCase(initPromos.fulfilled, (sliceState, action) => {
      for (const promo of action.payload.promos) {
        for (const reward of promo.rewards) {
          if (reward.type === 'token') {
            addPromoRewardTokenToState(sliceState, promo.chainId, reward);
          }
        }
      }
    });

    // when minter list is fetched, add all new tokens
    builder.addCase(fetchAllMinters.fulfilled, (sliceState, action) => {
      for (const [chainId, minters] of entries(action.payload.byChainId)) {
        if (minters) {
          for (const minter of minters) {
            addMinterToState(sliceState, chainId, minter);
          }
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
    builder
      .addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
        const {
          config: { source, tokens },
        } = action.payload;

        const sourceToken = addBridgeTokenToState(
          sliceState,
          {
            ...source,
            type: 'erc20',
            buyUrl: undefined,
            website: undefined,
            documentation: undefined,
            description: undefined,
            risks: [],
          },
          true
        );

        for (const [chainId, address] of entries(tokens)) {
          if (!address) {
            continue;
          }

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
      })
      .addCase(fetchAllCurrentCowcentratedRanges.fulfilled, (sliceState, action) => {
        for (const [oracleId, value] of Object.entries(action.payload)) {
          sliceState.cowcentratedRanges.byOracleId[oracleId] = {
            priceRangeMax: new BigNumber(value.priceRangeMax),
            priceRangeMin: new BigNumber(value.priceRangeMin),
            currentPrice: new BigNumber(value.currentPrice),
          };
        }
      });
  },
});

export const addToken = tokensSlice.actions.addToken;

function addBridgeTokenToState(
  sliceState: Draft<TokensState>,
  token: TokenErc20,
  trackBalance: boolean
): TokenErc20 {
  const chainId = token.chainId;
  const addressLower = token.address.toLowerCase();
  const chainState = getOrCreateTokensChainState(sliceState, chainId);

  // If it doesn't exist then, add it
  if (chainState.byAddress[addressLower] === undefined) {
    chainState.byAddress[addressLower] = token;
  }

  // id => address mapping
  if (chainState.byId[token.id] === undefined) {
    chainState.byId[token.id] = addressLower;
  }

  // grab existing/added token
  const stateToken = chainState.byAddress[addressLower];

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

  // At least one balance should be > 0
  if (
    breakdown.balances.length > 0 &&
    breakdown.balances.find(balance => balance !== '0') === undefined
  ) {
    // console.warn(`[LP Breakdown] ${oracleId} has all zero balances`);
    return;
  }

  if (
    'underlyingBalances' in breakdown &&
    breakdown.underlyingBalances &&
    breakdown.underlyingBalances.length !== breakdown.tokens.length
  ) {
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
  const chainState = getOrCreateTokensChainState(sliceState, chainId);

  for (const [addressBookId, token] of Object.entries(addressBookPayload.addressBook)) {
    if (isTokenNative(token)) {
      // native tokens are preloaded when chain configs load
      const existingToken = chainState.byAddress['native'];

      // Add missing information
      existingToken.buyUrl = existingToken.buyUrl || token.buyUrl;
      existingToken.description = existingToken.description || token.description;
      existingToken.website = existingToken.website || token.website;
      continue;
    }

    if (chainState.byId[token.id] === undefined) {
      chainState.byId[token.id] = token.address.toLowerCase();
    }

    if (chainState.byAddress[token.address.toLowerCase()] === undefined) {
      chainState.byAddress[token.address.toLowerCase()] = token;
    } else {
      const existingToken = chainState.byAddress[token.address.toLowerCase()];

      // Address book is source of truth for oracle ids
      if (token.oracleId) {
        existingToken.oracleId = token.oracleId;
      } else {
        console.error(
          `[Addressbook] ${existingToken.id}/${existingToken.address}/${existingToken.chainId} has no oracleId`
        );
      }

      // Address book is source of truth for symbols
      if (token.symbol) {
        existingToken.symbol = token.symbol;
      } else {
        console.error(
          `[Addressbook] ${existingToken.id}/${existingToken.address}/${existingToken.chainId} has no symbol`
        );
      }

      // Add missing information
      existingToken.buyUrl = existingToken.buyUrl || token.buyUrl;
      existingToken.description = existingToken.description || token.description;
      existingToken.website = existingToken.website || token.website;
      if (isTokenErc20(existingToken)) {
        existingToken.bridge = existingToken.bridge || token.bridge;
        existingToken.risks = tempFilterRisks(existingToken.risks || token.risks || []); // FIXME remove once we support multiple risks types
      }
    }

    if (addressBookId === 'WNATIVE' && !chainState.wnative) {
      chainState.wnative = token.id;
    }
  }
}

function tempFilterRisks(risks: string[]) {
  return risks.filter(risk => risk === 'NO_TIMELOCK');
}

function addPromoRewardTokenToState(
  sliceState: Draft<TokensState>,
  chainId: ChainEntity['id'],
  promoReward: PromoTokenRewardConfig
) {
  const chainState = getOrCreateTokensChainState(sliceState, promoReward.chainId || chainId);
  const tokenAddress = promoReward.address;
  const addressKey = tokenAddress.toLowerCase();

  // Add if it does not exist already
  if (chainState.byAddress[addressKey] === undefined) {
    const token: TokenErc20 = {
      id: promoReward.symbol,
      type: 'erc20',
      chainId: chainId,
      address: promoReward.address,
      oracleId: promoReward.oracleId,
      decimals: promoReward.decimals,
      symbol: promoReward.symbol,
      buyUrl: undefined,
      description: undefined,
      website: undefined,
      documentation: undefined,
      risks: [],
    };
    addTokenToState(sliceState, token, true);
  }
}

function addMinterToState(
  sliceState: Draft<TokensState>,
  chainId: ChainEntity['id'],
  apiMinter: MinterConfig
) {
  const chainState = getOrCreateTokensChainState(sliceState, chainId);
  for (const sourceToken of [apiMinter.depositToken, apiMinter.mintedToken]) {
    const addressKey =
      sourceToken.type === 'erc20' ? sourceToken.contractAddress.toLowerCase() : 'native';

    // Skip native tokens, they are loaded from config
    if (addressKey === 'native') {
      continue;
    }

    // Add if it does not exist already
    if (chainState.byAddress[addressKey] === undefined) {
      const token: TokenErc20 = {
        id: sourceToken.symbol,
        symbol: sourceToken.symbol,
        chainId: chainId,
        oracleId: sourceToken.oracleId,
        address: sourceToken.contractAddress,
        decimals: sourceToken.decimals,
        buyUrl: undefined,
        type: 'erc20',
        description: undefined,
        website: undefined,
        documentation: undefined,
        risks: [],
      };
      addTokenToState(sliceState, token, true);
    }
  }
}

function addVaultToState(sliceState: Draft<TokensState>, config: VaultConfig, entity: VaultEntity) {
  const chainId = entity.chainId;
  const chainState = getOrCreateTokensChainState(sliceState, chainId);

  // add assets id's from active vaults to state
  if (config.status === 'active' && config.assets) {
    for (const assetId of config.assets) {
      if (!chainState.tokenIdsInActiveVaults.includes(assetId)) {
        chainState.tokenIdsInActiveVaults.push(assetId);
      }
    }
  }

  //
  // Deposit token
  //
  const depositToken = getDepositTokenFromLegacyVaultConfig(chainId, config);
  if (depositToken) {
    const depositAddressKey = depositToken.address.toLowerCase();
    const existingDepositToken = chainState.byAddress[depositAddressKey];
    if (existingDepositToken === undefined) {
      // Add the token
      addTokenToState(sliceState, depositToken, config.type !== 'cowcentrated');
    } else {
      // Only add missing information
      // Note: we no longer overwrite oracleId as addressbook is now source of truth
      if (!existingDepositToken.providerId) {
        existingDepositToken.providerId = depositToken.providerId;
      }
    }
    if (config.type === 'cowcentrated' && config.depositTokenAddresses) {
      config.depositTokenAddresses.forEach(address =>
        ensureInterestingToken(address, chainId, sliceState)
      );
    }
  }

  //
  // Receipt token
  //
  // (Only v2 + of gov vaults have a receipt token)
  if (config.type !== 'gov' || (config.version || 1) > 1) {
    // rename clm and clm reward pool receipt tokens to a friendlier name
    const receiptTokenSymbol =
      isCowcentratedVault(entity) ? `${entity.names.short} CLM`
      : isCowcentratedGovVault(entity) ? `${entity.names.short} rCLM`
      : isCowcentratedStandardVault(entity) ? `${entity.names.short} mooCLM`
      : config.earnedToken;

    const receiptToken: TokenErc20 = {
      type: 'erc20',
      id: config.id,
      chainId: chainId,
      oracleId: config.oracleId,
      address: config.earnContractAddress,
      providerId: config.tokenProviderId, // FIXME only true for cowcentrated gov pools
      decimals: 18, // receipt token always has 18 decimals
      symbol: receiptTokenSymbol, // earnedToken === receipt token in this context
      buyUrl: undefined,
      website: undefined,
      description: undefined,
      documentation: undefined,
      risks: [],
    };

    // We always let the vault overwrite the receipt token, even if it was added via deposit token of another vault
    addTokenToState(sliceState, receiptToken, true);

    // Add bridged versions of receipt token
    if (config.bridged) {
      addBridgedReceiptTokensToState(config, receiptToken, sliceState);
    }
  }

  //
  // Earned Token
  //
  // Only gov vaults have an earned token that isn't the receipt token
  if (config.type === 'gov') {
    // We just make sure we fetch balances of them
    // The tokens should exist in the address book
    if (config.earnedTokenAddresses) {
      for (const address of config.earnedTokenAddresses) {
        ensureInterestingToken(address, chainId, sliceState);
      }
    } else if (config.earnedTokenAddress) {
      ensureInterestingToken(config.earnedTokenAddress, chainId, sliceState);
    }
  }
}

function addBridgedReceiptTokensToState(
  vault: VaultConfig,
  token: TokenErc20,
  sliceState: Draft<TokensState>
) {
  if (!vault.bridged) {
    return;
  }

  const bridgedTokens = entries(vault.bridged).map(([chainId, address]) => ({
    ...token,
    id: `${token.id}`,
    chainId,
    address,
    description: token.description || undefined, // we leave description undefined so that addressbook can fill it in
  }));

  for (const bridgedToken of bridgedTokens) {
    const chainState = getOrCreateTokensChainState(sliceState, bridgedToken.chainId);
    const bridgedAddressKey = bridgedToken.address.toLowerCase();
    const existingBridgedToken = chainState.byAddress[bridgedAddressKey];

    // Add bridged receipt token
    if (!existingBridgedToken) {
      addTokenToState(sliceState, bridgedToken, true);
    } else {
      // Make sure bridged receipt token is marked as interesting
      ensureInterestingToken(bridgedToken.address, bridgedToken.chainId, sliceState);
    }
  }
}

function ensureInterestingToken(
  address: string,
  chainId: ChainEntity['id'],
  sliceState: Draft<TokensState>
) {
  const chainState = getOrCreateTokensChainState(sliceState, chainId);
  if (!chainState.interestingBalanceTokenAddresses.includes(address)) {
    chainState.interestingBalanceTokenAddresses.push(address);
  }
}

function getOrCreateTokensChainState(sliceState: Draft<TokensState>, chainId: ChainEntity['id']) {
  let chainState = sliceState.byChainId[chainId];

  if (chainState === undefined) {
    chainState = sliceState.byChainId[chainId] = {
      byId: {},
      byAddress: {},
      interestingBalanceTokenAddresses: [],
      tokenIdsInActiveVaults: [],
      native: undefined,
      wnative: undefined,
    };
  }

  return chainState;
}

function addTokenToStateIfNotExists(
  sliceState: Draft<TokensState>,
  token: TokenEntity,
  interesting: boolean = false
) {
  const chainState = getOrCreateTokensChainState(sliceState, token.chainId);
  const addressKey = token.address.toLowerCase();
  if (!chainState.byAddress[addressKey]) {
    addTokenToState(sliceState, token, interesting);
  } else if (interesting) {
    ensureInterestingToken(token.address, token.chainId, sliceState);
  }
}

function addTokenToState(
  sliceState: Draft<TokensState>,
  token: TokenEntity,
  interesting: boolean = false
) {
  const chainState = getOrCreateTokensChainState(sliceState, token.chainId);
  if (token.id === chainState.native && !isTokenNative(token)) {
    console.warn(`addTokenToState: can not override native token ${token.id} with ERC20 token`);
    token.id = `erc20-${token.id}`;
  }

  const addressKey = token.address.toLowerCase();
  chainState.byId[token.id] = token.address.toLowerCase();
  chainState.byAddress[addressKey] = token;
  if (interesting) {
    ensureInterestingToken(token.address, token.chainId, sliceState);
  }
}
