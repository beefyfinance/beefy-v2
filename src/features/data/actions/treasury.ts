import BigNumber from 'bignumber.js';
import { entries } from '../../../helpers/object.ts';
import { isVaultHoldingConfig, type TreasuryHoldingConfig } from '../apis/config-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TreasuryHoldingEntity } from '../entities/treasury.ts';
import type { AddressHolding, AddressHoldingByChainId } from '../reducers/treasury-types.ts';
import { selectActiveChainIds } from '../selectors/chains.ts';
import { selectIsTokenLoadedOnChain } from '../selectors/tokens.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export interface FetchTreasuryFulfilledPayload {
  addressHoldingByChainId: AddressHoldingByChainId;
}

export const fetchTreasury = createAppAsyncThunk<FetchTreasuryFulfilledPayload>(
  'treasury/fetchTreasury',
  async (_, { getState }) => {
    const state = getState();
    const api = await getBeefyApi();

    const activeChainIds = selectActiveChainIds(state);
    const data = await api.getTreasury();
    const addressHoldingByChainId: AddressHoldingByChainId = {};

    for (const [chainId, balances] of entries(data.treasury)) {
      if (activeChainIds.includes(chainId)) {
        const items: Record<string, AddressHolding> = {};
        for (const [address, data] of Object.entries(balances)) {
          items[address] = {
            address: address,
            name: data.name,
            balances: mapBalances(state, data.balances, chainId),
          };
        }
        addressHoldingByChainId[chainId] = items;
      }
    }

    return { addressHoldingByChainId };
  }
);

const mapBalances = (
  state: BeefyState,
  balances: {
    [address: string]: TreasuryHoldingConfig;
  },
  chainId: ChainEntity['id']
) => {
  return Object.values(balances).reduce(
    (totals, token) => {
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
    },
    {} as Record<string, TreasuryHoldingEntity>
  );
};
