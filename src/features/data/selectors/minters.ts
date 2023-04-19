import type { BeefyState } from '../../../redux-types';
import type { MinterEntity } from '../entities/minter';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectMinterById = (state: BeefyState, minterId: MinterEntity['id']) => {
  const mintersById = state.entities.minters.byId;
  if (mintersById[minterId] === undefined) {
    throw new Error(`selectMinterById: Unknown minter id ${minterId}`);
  }
  return mintersById[minterId];
};

export const selectMintersByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.minters.byChainId[chainId] || [];
};

export const selectMintersByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): MinterEntity['id'][] => {
  return state.entities.minters.byVaultId[vaultId] || [];
};

export const selectMinterReserves = (state: BeefyState, minterId: MinterEntity['id']) => {
  return state.entities.minters.reservesById[minterId];
};

export const selectAreMintersLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.minters.alreadyLoadedOnce;

export const selectShouldInitMinters = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.minters);
