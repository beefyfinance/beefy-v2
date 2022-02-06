import { createSelector } from '@reduxjs/toolkit';
import { VaultEntity } from '../entities/vault';
import { BeefyState } from '../../../redux-types';
import { BIG_ZERO } from '../../../helpers/format';

export const selectVaultTvl = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.tvl.byVaultId[vaultId],
  vaultTvl => {
    if (vaultTvl) {
      return vaultTvl.tvl;
    } else {
      return BIG_ZERO;
    }
  }
);

export const selectTotalTvl = createSelector(
  (state: BeefyState) => state.biz.tvl.totalTvl,
  totalTvl => totalTvl
);
