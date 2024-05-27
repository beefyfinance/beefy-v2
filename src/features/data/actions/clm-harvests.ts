import { createAsyncThunk } from '@reduxjs/toolkit';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../../../redux-types';
import { selectVaultById, selectVaultStrategyAddressOrUndefined } from '../selectors/vaults';
import { getClmApi } from '../apis/instances';
import type {
  ApiClmHarvestPriceRow,
  ClmPendingRewardsResponse,
} from '../apis/clm-api/clm-api-types';
import type { ChainEntity } from '../entities/chain';
import { selectCowcentratedVaultDepositTokens } from '../selectors/tokens';

interface FetchClmHarvestsFulfilledAction {
  data: ApiClmHarvestPriceRow[];
  vaultAddress: VaultEntity['earnContractAddress'];
  chainId: ChainEntity['id'];
}

export const fetchClmHarvests = createAsyncThunk<
  FetchClmHarvestsFulfilledAction,
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('clmHarvests/fetchClmHarvests', async ({ vaultId }, { getState }) => {
  const state = getState();
  const { chainId, earnContractAddress: vaultAddress } = selectVaultById(state, vaultId);
  const api = await getClmApi();
  const data = await api.getClmHarvests(chainId, vaultAddress);
  return { data, vaultAddress, chainId };
});

interface FetchClmPendingRewardsFulfilledAction {
  data: ClmPendingRewardsResponse;
  vaultAddress: VaultEntity['earnContractAddress'];
  chainId: ChainEntity['id'];
}

export const fetchClmPendingRewards = createAsyncThunk<
  FetchClmPendingRewardsFulfilledAction,
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('clmHarvests/fetchClmPendingRewards', async ({ vaultId }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);

  const { chainId, earnContractAddress: vaultAddress } = vault;

  const { token0, token1 } = selectCowcentratedVaultDepositTokens(state, vaultId);

  const stratAddr = selectVaultStrategyAddressOrUndefined(state, vaultId);
  const api = await getClmApi();

  const { fees0, fees1, totalSupply } = await api.getClmPendingRewards(
    state,
    chainId,
    stratAddr,
    vaultAddress
  );

  return {
    data: {
      fees0: fees0.shiftedBy(-token0.decimals),
      fees1: fees1.shiftedBy(-token1.decimals),
      totalSupply: totalSupply.shiftedBy(-18),
    },
    chainId,
    vaultAddress,
  };
});
