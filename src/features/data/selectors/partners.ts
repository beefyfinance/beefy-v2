import { isCowcentratedLikeVault, type VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectVaultById } from './vaults.ts';

export const selectIsVaultQidao = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.qidao.byVaultId[vaultId] !== undefined;
};

export const selectIsVaultNexus = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return (
    !isCowcentratedLikeVault(vault) &&
    state.biz.partners.nexus.byChainId[vault.chainId] !== undefined
  );
};

export const selectIsBeFTM = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.id === 'beefy-beFTM';
};

export const selectIsPoolTogether = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.poolTogether !== undefined;
};
