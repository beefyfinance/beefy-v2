import type { BeefyState } from '../../../redux-types';
import { isCowcentratedVault, type VaultEntity } from '../entities/vault';
import { selectVaultById } from './vaults';

export const selectIsVaultQidao = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.qidao.byVaultId[vaultId] !== undefined;
};
export const selectIsOpenCover = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return state.biz.partners.openCover.byChainId[vault.chainId] !== undefined;
};

export const selectIsVaultNexus = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return (
    !isCowcentratedVault(vault) && state.biz.partners.nexus.byChainId[vault.chainId] !== undefined
  );
};

export const selectIsBeFTM = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.id === 'beefy-beFTM';
};
