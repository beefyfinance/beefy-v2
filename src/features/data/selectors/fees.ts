import { createCachedSelector } from 're-reselect';
import type { VaultEntity } from '../entities/vault.ts';
import type { VaultFee } from '../reducers/fees-types.ts';
import type { BeefyState } from '../store/types.ts';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from './data-loader-helpers.ts';
import { selectIsVaultGov, selectVaultDepositFee } from './vaults.ts';

const GOV_FEES: Readonly<VaultFee> = {
  id: 'gov-fees',
  call: 0,
  stakers: 0,
  strategist: 0,
  total: 0,
  withdraw: 0,
  deposit: 0,
  treasury: 0,
};

export const selectAreFeesLoaded = createGlobalDataSelector('fees', hasLoaderFulfilledOnce);

export const selectShouldInitFees = createGlobalDataSelector('fees', shouldLoaderLoadOnce);

export const selectFeesByVaultId = createCachedSelector(
  selectVaultDepositFee,
  selectIsVaultGov,
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.fees.byId[vaultId],
  (vaultDepositFee: number, isGov: boolean, fees: VaultFee | undefined): VaultFee | undefined => {
    if (isGov && !fees) {
      return GOV_FEES;
    }

    // API vault fee overrides vault config fee
    if (fees && fees.deposit === undefined) {
      return {
        ...fees,
        deposit: vaultDepositFee,
      };
    }

    return fees;
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
