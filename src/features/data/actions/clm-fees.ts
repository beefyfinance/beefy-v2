import type { ClmFee } from '../apis/clm-fees/clm-fees-types.ts';
import { getClmFeesApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isCowcentratedVault } from '../entities/vault.ts';
import { selectChainById } from '../selectors/chains.ts';
import {
  selectAreClmFeeRangesLoaded,
  selectIsClmSwapFeeDynamic,
  selectVaultById,
  selectVaultIdsByChainIdIncludingHidden,
} from '../selectors/vaults.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchClmFeesParams = {
  chainId: ChainEntity['id'];
};

export type FetchClmFeesFulfilledPayload = {
  chainId: ChainEntity['id'];
  fees: ClmFee[];
  rangesLoaded: boolean;
};

/** Probes every CLM pool for fee bounds until that succeeds, then only refreshes the dynamic fees */
export const fetchClmFeesAction = createAppAsyncThunk<
  FetchClmFeesFulfilledPayload,
  FetchClmFeesParams
>('vaults/fetchClmFees', async ({ chainId }, { getState }) => {
  const state = getState();
  const clms = selectVaultIdsByChainIdIncludingHidden(state, chainId)
    .map(vaultId => selectVaultById(state, vaultId))
    .filter(isCowcentratedVault);
  if (!clms.length) {
    return { chainId, fees: [], rangesLoaded: true };
  }

  const api = await getClmFeesApi(selectChainById(state, chainId));
  if (!selectAreClmFeeRangesLoaded(state, chainId)) {
    const { fees, complete } = await api.fetchSwapFeesWithRange(clms);
    return { chainId, fees, rangesLoaded: complete };
  }

  const dynamicClms = clms.filter(clm => selectIsClmSwapFeeDynamic(state, clm.id));
  return {
    chainId,
    fees: dynamicClms.length ? await api.fetchSwapFees(dynamicClms) : [],
    rangesLoaded: true,
  };
});
