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
import { entries } from '../../../helpers/object';

/**
 * State containing Vault infos
 */
export type TokensState = {
  // we need to split by chain because tokens from different chains have the same ids
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      byId: {
        [id: string]: TokenEntity['address'];
      };
      byAddress: {
        [address: string]: TokenEntity;
      };
      native: TokenNative['id'] | undefined;
      wnative: TokenErc20['id'] | undefined;
      /**
       * we keep the list of tokens where we could be interested in fetching the balance of
       * it would be more correct to put those inside the balance reducer but this token
       * reducer has a number of config fixes that I find would make for a more complex code
       * if refactored. And we have to update the config anyway to make it smaller, so move this
       * inside the balance reducer once the config is reworked
       */
      interestingBalanceTokenAddresses: TokenEntity['address'][];
      /** list of tokens that have an active vault */
      tokenIdsInActiveVaults: TokenEntity['id'][];
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
        const chainState = getOrCreateTokensChainState(sliceState, chainId);
        const tokenId = chainConf.walletSettings.nativeCurrency.symbol;
        const existingNative = chainState.byAddress['native'];

        const token: TokenNative = {
          id: tokenId,
          chainId: chainId,
          oracleId: tokenId,
          decimals: chainConf.walletSettings.nativeCurrency.decimals,
          address: 'native',
          symbol: chainConf.walletSettings.nativeCurrency.symbol,
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
      for (const [chainId, vaults] of entries(action.payload.byChainId)) {
        if (vaults) {
          const chain = selectChainById(action.payload.state, chainId);
          for (const vault of vaults) {
            addVaultToState(action.payload.state, sliceState, chain, vault);
          }
        }
      }
    });

    // when boost list is fetched, add all new tokens
    builder.addCase(fetchAllBoosts.fulfilled, (sliceState, action) => {
      for (const [chainId, boosts] of entries(action.payload.boostsByChainId)) {
        for (const boost of boosts) {
          addBoostToState(sliceState, chainId, boost);
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
    builder.addCase(fetchBridgeConfig.fulfilled, (sliceState, action) => {
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

function addBoostToState(
  sliceState: Draft<TokensState>,
  chainId: ChainEntity['id'],
  apiBoost: BoostConfig
) {
  const chainState = getOrCreateTokensChainState(sliceState, chainId);
  const tokenAddress = getBoostTokenAddressFromLegacyConfig(apiBoost);
  const addressKey = tokenAddress.toLowerCase();

  // Add if it does not exist already
  if (chainState.byAddress[addressKey] === undefined) {
    const token: TokenErc20 = {
      id: apiBoost.earnedToken,
      type: 'erc20',
      chainId: chainId,
      address: apiBoost.earnedTokenAddress,
      oracleId: apiBoost.earnedOracleId,
      decimals: apiBoost.earnedTokenDecimals,
      symbol: apiBoost.earnedToken,
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

function addVaultToState(
  state: BeefyState,
  sliceState: Draft<TokensState>,
  chain: ChainEntity,
  vault: VaultConfig
) {
  const chainId = chain.id;
  const chainState = getOrCreateTokensChainState(sliceState, chainId);

  // add assets id's from active vaults to state
  if (vault.status === 'active' && vault.assets) {
    for (const assetId of vault.assets) {
      if (!chainState.tokenIdsInActiveVaults.includes(assetId)) {
        chainState.tokenIdsInActiveVaults.push(assetId);
      }
    }
  }

  //
  // Deposit token
  //
  const depositToken = getDepositTokenFromLegacyVaultConfig(chain, vault);
  const depositAddressKey = depositToken.address.toLowerCase();
  const existingDepositToken = chainState.byAddress[depositAddressKey];
  if (existingDepositToken === undefined) {
    // Add the token

    addTokenToState(sliceState, depositToken, true);
  } else {
    // Only add missing information
    // Note: we no longer overwrite oracleId as addressbook is now source of truth
    if (!existingDepositToken.providerId) {
      existingDepositToken.providerId = depositToken.providerId;
    }
  }

  //
  // Earned token
  //
  const earnedAddressKey = vault.earnedTokenAddress
    ? vault.earnedTokenAddress.toLowerCase()
    : 'native';
  const existingEarnedToken = chainState.byAddress[earnedAddressKey];
  if (existingEarnedToken === undefined) {
    // Do not add native token from configs, keep config as source of truth
    if (earnedAddressKey !== 'native') {
      let token: TokenErc20;

      if (vault.type === 'gov') {
        // Add earned token
        token = {
          type: 'erc20',
          id: vault.earnedToken,
          chainId: chainId,
          oracleId: vault.oracleId,
          decimals: vault.earnedTokenDecimals ?? 18,
          address: vault.earnedTokenAddress,
          symbol: vault.earnedToken,
          buyUrl: undefined,
          website: undefined,
          description: undefined,
          documentation: undefined,
          risks: [],
        };
      } else if (
        vault.type === 'standard' ||
        vault.type === 'cowcentrated' ||
        vault.type === undefined
      ) {
        // Add receipt token
        token = {
          type: 'erc20',
          id: vault.earnedToken,
          chainId: chainId,
          oracleId: vault.oracleId,
          address: vault.earnedTokenAddress,
          decimals: 18, // receipt token always has 18 decimals
          symbol: vault.earnedToken,
          buyUrl: undefined,
          website: undefined,
          description: undefined,
          documentation: undefined,
          risks: [],
        };

        // Add bridged versions of receipt token
        if (vault.bridged) {
          addBridgedReceiptTokensToState(vault, token, sliceState);
        }
      } else {
        throw new Error(`Unknown vault type ${vault.type}`);
      }

      addTokenToState(sliceState, token, true);
    }
  } else {
    /** address book loaded first, and the vault receipt token is in the address book */
    // make sure vault token is still tagged as an interesting address
    if (vault.earnedTokenAddress && vault.earnedTokenAddress !== 'native') {
      ensureInterestingToken(vault.earnedTokenAddress, chainId, sliceState);
    }

    // make sure bridged tokens are added/are marked as interesting
    if (vault.type !== 'gov' && vault.bridged) {
      const token = chainState.byAddress[earnedAddressKey];
      if (isTokenErc20(token)) {
        addBridgedReceiptTokensToState(vault, token, sliceState);
      }
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
    chainState.interestingBalanceTokenAddresses.push(token.address);
  }
}
