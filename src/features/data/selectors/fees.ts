import { createCachedSelector } from 're-reselect';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { VaultFee } from '../reducers/fees';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectIsVaultGov } from './vaults';

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
  state.ui.dataLoader.global.fees.alreadyLoadedOnce;

export const selectShouldInitFees = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.fees);

export const selectFeesByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectIsVaultGov(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.fees.byId[vaultId],
  (isGov: boolean, fees: VaultFee) => (isGov ? GOV_FEES : fees)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
