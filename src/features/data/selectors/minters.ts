import type { BeefyState } from '../../../redux-types';
import type { MinterEntity } from '../entities/minter';
import type { ChainEntity } from '../entities/chain';
import { isGovVault, isStandardVault, type VaultEntity } from '../entities/vault';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectVaultById } from './vaults';

export const selectMinterById = (state: BeefyState, minterId: MinterEntity['id']) => {
  const mintersById = state.entities.minters.byId;
  const minter = mintersById[minterId];
  if (minter === undefined) {
    throw new Error(`selectMinterById: Unknown minter id ${minterId}`);
  }
  return minter;
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

export const selectMinterTotalSupply = (state: BeefyState, minterId: MinterEntity['id']) => {
  return state.entities.minters.totalSupplyById[minterId];
};

export const selectAreMintersLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.minters.lastFulfilled !== undefined;

export const selectShouldInitMinters = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.minters);

export const selectMinterVaultsType = (state: BeefyState, minterId: MinterEntity['id']) => {
  const minter = selectMinterById(state, minterId);
  const { vaultsCount, govsCount } = minter.vaultIds.reduce(
    (counts, vaultId) => {
      const vault = selectVaultById(state, vaultId);
      counts.vaultsCount += isStandardVault(vault) ? 1 : 0;
      counts.govsCount += isGovVault(vault) ? 1 : 0;
      return counts;
    },
    { vaultsCount: 0, govsCount: 0 }
  );
  return vaultsCount > 0 && govsCount > 0
    ? 'WithEarnings'
    : vaultsCount > 0 && govsCount === 0
    ? 'WithoutEarnings'
    : 'OnlyEarnings';
};
