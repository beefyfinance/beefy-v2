import { VaultEntity } from '../entities/vault';
import { BeefyState } from '../../../redux-types';
import { BIG_ZERO } from '../../../helpers/big-number';

export const selectVaultTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.tvl || BIG_ZERO;

export const selectTotalTvl = (state: BeefyState) => state.biz.tvl.totalTvl;

export const selectTvlByChain = (state: BeefyState) => state.biz.tvl.byChaindId;
