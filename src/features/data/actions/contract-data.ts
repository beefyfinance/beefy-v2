import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import { getContractDataApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import {
  isCowcentratedVault,
  isErc4626Vault,
  isGovVault,
  isGovVaultMulti,
  isGovVaultSingle,
  isStandardVault,
  type VaultCowcentrated,
  type VaultErc4626,
  type VaultGov,
  type VaultGovMulti,
  type VaultStandard,
} from '../entities/vault.ts';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts.ts';
import { selectChainById } from '../selectors/chains.ts';
import {
  selectVaultById,
  selectVaultByIdOrUndefined,
  selectVaultIdsByChainIdIncludingHidden,
} from '../selectors/vaults.ts';
import { featureFlag_simulateRpcError } from '../utils/feature-flags.ts';
import { partition } from 'lodash-es';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllContractDataFulfilledPayload {
  chainId: ChainEntity['id'];
  data: FetchAllContractDataResult;
  // Reducers handling this action need access to the full state
  state: BeefyState;
}

export const fetchAllContractDataByChainAction = createAsyncThunk<
  FetchAllContractDataFulfilledPayload,
  ActionParams,
  {
    state: BeefyState;
  }
>('contract-data/fetchAllContractDataByChainAction', async ({ chainId }, { getState }) => {
  if (featureFlag_simulateRpcError(chainId)) {
    throw new Error('Simulated RPC error');
  }

  const state = getState();
  const chain = selectChainById(state, chainId);
  const contractApi = await getContractDataApi(chain);

  // maybe have a way to retrieve those easily
  const allBoosts = selectBoostsByChainId(state, chainId)
    .map(vaultId => selectBoostById(state, vaultId))
    .filter(boost => selectVaultByIdOrUndefined(state, boost.vaultId) !== undefined);
  const allVaults = selectVaultIdsByChainIdIncludingHidden(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const standardVaults: VaultStandard[] = [];
  const govVaults: VaultGov[] = [];
  const govVaultsMulti: VaultGovMulti[] = [];
  const cowcentratedLiquidityVaults: VaultCowcentrated[] = [];
  const erc4626Vaults: VaultErc4626[] = [];

  for (const vault of allVaults) {
    if (isGovVault(vault)) {
      if (isGovVaultSingle(vault)) {
        govVaults.push(vault);
      } else if (isGovVaultMulti(vault)) {
        govVaultsMulti.push(vault);
      } else {
        throw new Error(`Unknown vault type ${vault.type} ${vault.subType}`);
      }
    } else if (isStandardVault(vault)) {
      standardVaults.push(vault);
    } else if (isCowcentratedVault(vault)) {
      cowcentratedLiquidityVaults.push(vault);
    } else if (isErc4626Vault(vault)) {
      erc4626Vaults.push(vault);
    } else {
      // @ts-expect-error all vault.type are handled
      throw new Error(`Unknown vault type ${vault.type}`);
    }
  }
  const [boostsMulti, boosts] = partition(allBoosts, b => b.version >= 2);

  const res = await contractApi.fetchAllContractData(state, {
    standardVaults,
    erc4626Vaults,
    govVaults,
    govVaultsMulti,
    cowVaults: cowcentratedLiquidityVaults,
    boosts,
    boostsMulti,
  });

  // always re-fetch the latest state
  return {
    chainId,
    data: res,
    state: getState(),
  };
});
