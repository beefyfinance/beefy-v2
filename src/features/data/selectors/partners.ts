import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectBoostById, selectPreStakeOrActiveBoostIds } from './boosts';
import { selectVaultById } from './vaults';

export const selectIsVaultQidao = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.qidao.byVaultId[vaultId] !== undefined;
};
export const selectIsVaultInsurace = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return state.biz.partners.insurace.byChainId[vault.chainId] !== undefined;
};

export const selectIsVaultNexus = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return state.biz.partners.nexus.byChainId[vault.chainId] !== undefined;
};
export const selectIsVaultBinSpirit = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.id === 'beefy-binspirit';
};
export const selectIsBeFTM = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.id === 'beefy-beFTM';
};

export const selectBoostedVaultMainPartner = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const boostIds = selectPreStakeOrActiveBoostIds(state, vaultId);
  const boost = selectBoostById(state, boostIds[0]);
  const partner = state.biz.partners.byId[boost.partnerIds[0]];
  return partner;
};
