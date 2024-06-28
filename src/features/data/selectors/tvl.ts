import type { VaultEntity } from '../entities/vault';
import type { BeefyState } from '../../../redux-types';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectLpBreakdownForVault } from './tokens';
import { getVaultUnderlyingTvlAndBeefySharePercent } from '../../../helpers/tvl';
import { selectVaultById } from './vaults';

export const selectVaultTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.tvl || BIG_ZERO;

export const selectVaultUnderlyingTvlUsd = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  const breakdown = selectLpBreakdownForVault(state, vault);
  if (!breakdown) return BIG_ZERO;
  const tvl = selectVaultTvl(state, vault.id);
  const { underlyingTvl } = getVaultUnderlyingTvlAndBeefySharePercent(vault, breakdown, tvl);
  return underlyingTvl;
};

export const selectTotalTvl = (state: BeefyState) => state.biz.tvl.totalTvl;

export const selectTvlByChain = (state: BeefyState) => state.biz.tvl.byChaindId;
