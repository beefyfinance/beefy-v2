import { createSelector } from '@reduxjs/toolkit';
import { VaultEntity } from '../entities/vault';
import { formatUsd } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';

export const selectFormattedVaultTvl = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.tvl.byVaultId[vaultId],
  vaultTvl => {
    if (vaultTvl) {
      return formatUsd(vaultTvl.tvl.toNumber());
    } else {
      return formatUsd(0);
    }
  }
);

export const selectTotalTvl = createSelector(
  (state: BeefyState) => state.biz.tvl.totalTvl,
  totalTvl => totalTvl
);
