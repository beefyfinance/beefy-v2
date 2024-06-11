import { createCachedSelector } from 're-reselect';
import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import type { VaultFee } from '../reducers/fees';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectIsVaultGov, selectVaultDepositFee } from './vaults';
import { selectIsGlobalDataAvailable } from './data-loader';

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

export const selectAreFeesLoaded = (state: BeefyState) =>
  selectIsGlobalDataAvailable(state, 'fees');

export const selectShouldInitFees = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.fees);

export const selectFeesByVaultId = createCachedSelector(
  selectVaultDepositFee,
  selectIsVaultGov,
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.fees.byId[vaultId],
  (vaultDepositFee: number, isGov: boolean, fees: VaultFee | undefined): VaultFee | undefined => {
    if (isGov) {
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
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
