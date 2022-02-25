import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectActiveVaultBoostIds, selectBoostById } from './boosts';
import { selectVaultById } from './vaults';

export const selectIsVaultMoonpot = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.moonpot.byVaultId[vaultId] !== undefined;
};
export const selectMoonpotData = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const mpd = state.biz.partners.moonpot.byVaultId[vaultId];
  if (!mpd) {
    throw new Error(`Vault ${vaultId} do not have moonpot data`);
  }
  return mpd;
};
export const selectIsVaultQidao = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.qidao.byVaultId[vaultId] !== undefined;
};
export const selectIsVaultLacucina = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.lacucina.byVaultId[vaultId] !== undefined;
};
export const selectIsVaultInsurace = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return state.biz.partners.insurace.byChainId[vault.chainId] !== undefined;
};
export const selectIsVaultBinSpirit = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.id === 'beefy-binspirit';
};

export const selectBoostedVaultMainPartner = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const boostIds = selectActiveVaultBoostIds(state, vaultId);
  const boost = selectBoostById(state, boostIds[0]);
  const partner = state.biz.partners.byId[boost.partnerIds[0]];
  return partner;
};
