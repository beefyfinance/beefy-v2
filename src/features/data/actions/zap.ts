import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import { getBeefyApi, getConfigApi, getTransactApi } from '../apis/instances.ts';
import type { AmmConfig, SwapAggregatorConfig, ZapConfig } from '../apis/config-types.ts';
import { ZERO_ADDRESS } from '../../../helpers/addresses.ts';
import { selectAllVisibleVaultIds, selectVaultById } from '../selectors/vaults.ts';
import { isFulfilledResult } from '../../../helpers/promises.ts';
import type { VaultEntity } from '../entities/vault.ts';
import {
  featureFlag_kyberSwapSupport,
  featureFlag_OdosSwapSupport,
  featureFlag_oneInchSupport,
} from '../utils/feature-flags.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { ZapAggregatorTokenSupportResponse } from '../apis/beefy/beefy-api-types.ts';
import { entries } from '../../../helpers/object.ts';
import { selectAllChainIds } from '../selectors/chains.ts';

interface FetchAllZapsFulfilledPayload {
  zaps: ZapConfig[];
}

export const fetchZapConfigsAction = createAsyncThunk<
  FetchAllZapsFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('zap/fetchConfigs', async () => {
  const api = await getConfigApi();
  const zaps = await api.fetchZapConfigs();

  return { zaps: zaps.filter(zap => zap.router !== ZERO_ADDRESS) };
});

interface FetchAllSwapAggregatorsFulfilledPayload {
  aggregators: SwapAggregatorConfig[];
}

export const fetchZapSwapAggregatorsAction = createAsyncThunk<
  FetchAllSwapAggregatorsFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('zap/fetchSwapAggregators', async () => {
  const api = await getConfigApi();
  const aggregators = await api.fetchZapSwapAggregators();

  return { aggregators };
});

export type CalculateZapAvailabilityFulfilledPayload = {
  vaultIds: VaultEntity['id'][];
};

export const calculateZapAvailabilityAction = createAsyncThunk<
  CalculateZapAvailabilityFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('zap/calculateZapAvailability', async (_, { getState }) => {
  const state = getState();
  const allVaults = selectAllVisibleVaultIds(state)
    .map(id => selectVaultById(state, id))
    .filter(v => v.zaps?.length > 0);
  const api = await getTransactApi();
  const hasZap = await Promise.allSettled(allVaults.map(v => api.fetchVaultHasZap(v.id, getState)));

  return {
    vaultIds: allVaults
      .filter((_, i) => {
        const result = hasZap[i];
        if (isFulfilledResult(result)) {
          return result.value;
        }
        return false;
      })
      .map(v => v.id),
  };
});

export type FetchZapAggregatorTokenSupportFulfilledPayload = ZapAggregatorTokenSupportResponse;

export const fetchZapAggregatorTokenSupportAction = createAsyncThunk<
  FetchZapAggregatorTokenSupportFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('zap/fetchAggregatorTokenSupport', async (_, { getState }) => {
  const api = await getBeefyApi();
  const supportByChain = await api.getZapAggregatorTokenSupport();
  const chainIds = selectAllChainIds(getState());
  const isChainId = (chainId: string): chainId is ChainEntity['id'] =>
    !!chainIds.find(id => id === chainId);

  // For testing
  const extraSupport = {
    'one-inch': featureFlag_oneInchSupport(),
    kyber: featureFlag_kyberSwapSupport(),
    odos: featureFlag_OdosSwapSupport(),
  };

  for (const [key, support] of entries(extraSupport)) {
    if (support.length) {
      for (const { chainId, tokenAddress } of support) {
        if (!isChainId(chainId)) {
          continue;
        }
        supportByChain[chainId] ??= {};
        supportByChain[chainId][tokenAddress] ??= {};
        supportByChain[chainId][tokenAddress][key] = true;
      }
    }
  }

  return supportByChain;
});

export interface FetchZapAmmsFulfilledPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: AmmConfig[];
  };
}

export const fetchZapAmmsAction = createAsyncThunk<
  FetchZapAmmsFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('zap/fetchAmms', async () => {
  const api = await getConfigApi();
  const amms = await api.fetchZapAmms();
  return { byChainId: amms };
});
