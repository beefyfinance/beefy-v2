import BigNumber from 'bignumber.js';
import { partition } from 'lodash-es';
import type {
  FetchAllContractDataResult,
  StandardVaultContractData,
} from '../apis/contract-data/contract-data-types.ts';
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
import { createAppAsyncThunk } from '../utils/store-utils.ts';

/**
 * Override values for vaults affected by external platform issues.
 * These vaults report incorrect balance() and getPricePerFullShare() values on-chain.
 * The values below are the correct values at the block before the issue.
 *
 * Raw values queried at specific blocks:
 * - silov2-avalanche-ausd-valamore (block 73541735): balance=492153165795, ppfs=1518690926181063910
 * - silov2-avalanche-usdt-valamore (block 73541735): balance=2251698412379, ppfs=1518986904932948066
 * - silov2-avalanche-usdc-mev (block 73541735): balance=3049903089584, ppfs=1490148745133000150
 * - silov2-arbitrum-usdc-valamore (block 409563489): balance=11591864596129, ppfs=1468794706954620224
 */
const CONTRACT_VAULT_OVERRIDES: Record<
  string,
  { balance: BigNumber; pricePerFullShare: BigNumber }
> = {
  'silov2-avalanche-ausd-valamore': {
    balance: new BigNumber('492153.165795'),
    pricePerFullShare: new BigNumber('1.51869092618106391'),
  },
  'silov2-avalanche-usdt-valamore': {
    balance: new BigNumber('2251698.412379'),
    pricePerFullShare: new BigNumber('1.518986904932948066'),
  },
  'silov2-avalanche-usdc-mev': {
    balance: new BigNumber('3049903.089584'),
    pricePerFullShare: new BigNumber('1.49014874513300015'),
  },
  'silov2-arbitrum-usdc-valamore': {
    balance: new BigNumber('11591864.596129'),
    pricePerFullShare: new BigNumber('1.468794706954620224'),
  },
};

/**
 * Apply overrides for vaults with incorrect on-chain values.
 * This ensures all consumers of contract data get the correct values.
 */
function applyContractVaultOverrides(
  contractData: FetchAllContractDataResult
): FetchAllContractDataResult {
  const overriddenStandardVaults = contractData.standardVaults.map(
    (vault): StandardVaultContractData => {
      const override = CONTRACT_VAULT_OVERRIDES[vault.id];
      if (override) {
        return {
          ...vault,
          balance: override.balance,
          pricePerFullShare: override.pricePerFullShare,
        };
      }
      return vault;
    }
  );

  return {
    ...contractData,
    standardVaults: overriddenStandardVaults,
  };
}

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllContractDataFulfilledPayload {
  chainId: ChainEntity['id'];
  contractData: FetchAllContractDataResult;
  // Reducers handling this action need access to the full state
  // state: BeefyState;
}

export const fetchAllContractDataByChainAction = createAppAsyncThunk<
  FetchAllContractDataFulfilledPayload,
  ActionParams
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
    contractData: applyContractVaultOverrides(res),
    state: getState(),
  };
});
