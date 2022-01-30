import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { ApyData, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { VaultEntity } from '../entities/vault';

export const selectVaultApyInfos = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.apy.byVaultId[vaultId]],
  (vaultApy): ApyData | number => {
    if (vaultApy === undefined) {
      return 0;
    }
    return vaultApy;
  }
);
