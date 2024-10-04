import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi, getConfigApi, getTransactApi } from '../apis/instances';
import type { AmmConfig, SwapAggregatorConfig, ZapConfig } from '../apis/config-types';
import { ZERO_ADDRESS } from '../../../helpers/addresses';
import { selectAllVisibleVaultIds, selectVaultById } from '../selectors/vaults';
import { isFulfilledResult } from '../../../helpers/promises';
import type { VaultEntity } from '../entities/vault';
import {
  featureFlag_OdosSwapSupport,
  featureFlag_kyberSwapSupport,
  featureFlag_oneInchSupport,
} from '../utils/feature-flags';
import type { ChainEntity } from '../entities/chain';
import type { ZapAggregatorTokenSupportResponse } from '../apis/beefy/beefy-api-types';

interface FetchAllZapsFulfilledPayload {
  zaps: ZapConfig[];
}

export const fetchZapConfigsAction = createAsyncThunk<
  FetchAllZapsFulfilledPayload,
  void,
  { state: BeefyState }
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
  { state: BeefyState }
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
  { state: BeefyState }
>('zap/calculateZapAvailability', async (_, { getState }) => {
  const state = getState();
  const allVaults = selectAllVisibleVaultIds(state)
    .map(id => selectVaultById(state, id))
    .filter(v => v.zaps?.length > 0);
  const api = await getTransactApi();
  const hasZap = await Promise.allSettled(allVaults.map(v => api.fetchVaultHasZap(v.id, getState)));

  return {
    vaultIds: allVaults
      .filter((v, i) => {
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
  { state: BeefyState }
>('zap/fetchAggregatorTokenSupport', async () => {
  const api = await getBeefyApi();
  const supportByChain = await api.getZapAggregatorTokenSupport();

  // For testing
  const extraSupport = {
    'one-inch': featureFlag_oneInchSupport(),
    kyber: featureFlag_kyberSwapSupport(),
    odos: featureFlag_OdosSwapSupport(),
  };

  for (const [key, support] of Object.entries(extraSupport)) {
    if (support.length) {
      for (const { chainId, tokenAddress } of support) {
        if (!supportByChain[chainId]) {
          supportByChain[chainId] = {};
        }
        if (!supportByChain[chainId][tokenAddress]) {
          supportByChain[chainId][tokenAddress] = {};
        }
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
  { state: BeefyState }
>('zap/fetchAmms', async () => {
  const api = await getConfigApi();
  const amms = await api.fetchZapAmms();
  return { byChainId: amms };
});
