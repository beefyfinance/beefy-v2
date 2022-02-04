import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { VaultEntity } from '../entities/vault';
import { byDecimals, formatUsd } from '../../../helpers/format';

export const selectFormattedVaultTvl = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.tvl.byVaultId[vaultId]],
  vaultTvl => {
    if (vaultTvl) {
      return formatUsd(vaultTvl.tvl.toNumber());
    } else {
      return formatUsd(0);
    }
  }
);
