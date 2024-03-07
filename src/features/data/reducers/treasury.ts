import { createSlice } from '@reduxjs/toolkit';
import { fetchTreasury } from '../actions/treasury';
import type { ChainEntity } from '../entities/chain';
import type { MarketMakerHoldingEntity, TreasuryHoldingEntity } from '../entities/treasury';
import BigNumber from 'bignumber.js';
import type { TreasuryHoldingConfig } from '../apis/config-types';
import { isVaultHoldingConfig } from '../apis/config-types';
import { selectIsTokenLoadedOnChain } from '../selectors/tokens';
import type { BeefyState } from '../../../redux-types';
import { entries } from '../../../helpers/object';

interface AddressHolding {
  address: string;
  name: string;
  balances: { [address: string]: TreasuryHoldingEntity };
}

interface ExchangeHolding {
  [tokenId: string]: MarketMakerHoldingEntity;
}

export interface TreasuryState {
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      [address: string]: AddressHolding;
    };
  };
  byMarketMakerId: {
    [marketMakerId: string]: {
      [exchangeId: string]: ExchangeHolding;
    };
  };
}

export const initialState: TreasuryState = {
  byChainId: {},
  byMarketMakerId: {},
};

export const treasurySlice = createSlice({
  name: 'treasury',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchTreasury.fulfilled, (sliceState, action) => {
      const { data, activeChainIds, state } = action.payload;
      // Store treasury assets and balances
      for (const [chainId, balances] of entries(data.treasury)) {
        if (activeChainIds.includes(chainId)) {
          const items = {};
          for (const [address, data] of Object.entries(balances)) {
            items[address] = {
              address: address,
              name: data.name,
              balances: mapBalances(state, data.balances, chainId),
            };
          }
          sliceState.byChainId[chainId] = items;
        }
      }
      // Store Market Maker assets and balances
      for (const [marketMakerId, marketMaker] of Object.entries(data.marketMaker)) {
        const items = {};
        for (const [exchangeId, exchange] of Object.entries(marketMaker)) {
          const tokens = {};
          for (const [tokenId, token] of Object.entries(exchange)) {
            tokens[tokenId] = {
              ...token,
              usdValue: new BigNumber(token.usdValue),
              balance: new BigNumber(token.balance),
            };
          }
          items[mapMMAndExchangeIds(exchangeId)] = tokens;
        }
        sliceState.byMarketMakerId[mapMMAndExchangeIds(marketMakerId)] = items;
      }
    });
  },
});

const mapBalances = (
  state: BeefyState,
  balances: { [address: string]: TreasuryHoldingConfig },
  chainId: ChainEntity['id']
) => {
  return Object.values(balances).reduce((totals, token) => {
    if (
      token.assetType === 'native' ||
      token.assetType === 'validator' ||
      token.assetType === 'concLiquidity' ||
      selectIsTokenLoadedOnChain(state, token.address, chainId)
    ) {
      const key = token.assetType === 'validator' ? token.id : token.address;
      totals[key] = {
        ...token,
        usdValue: new BigNumber(token.usdValue),
        balance: new BigNumber(token.balance),
        pricePerFullShare: new BigNumber(
          isVaultHoldingConfig(token) ? token.pricePerFullShare : '1'
        ),
      };
    }

    return totals;
  }, {} as Record<string, TreasuryHoldingEntity>);
};

const ID_MAPPINGS = {
  system9: 'System9',
  binance: 'Binance',
  cryptodotcom: 'Crypto.com',
};

const mapMMAndExchangeIds = (id: string) => {
  return ID_MAPPINGS[id] ?? id;
};
