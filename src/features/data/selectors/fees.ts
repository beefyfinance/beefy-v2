import { createCachedSelector } from 're-reselect';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { VaultFee } from '../reducers/fees';
import { isInitialLoader } from '../reducers/data-loader';

export const selectAreFeesLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.fees.alreadyLoadedOnce;

export const selectShouldInitFees = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.fees);

export const selectFeesByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.fees.byId[vaultId],
  (fees: VaultFee) => fees
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
