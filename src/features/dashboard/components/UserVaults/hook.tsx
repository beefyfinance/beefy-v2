import { sortBy } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectUserDepositedVaultIds, selectUserVaultsPnl } from '../../../data/selectors/balance';

export type SortedOptions = {
  sort: 'atDeposit' | 'now' | 'yield' | 'pnl' | 'apy' | 'dailyYield' | 'default';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedDashboardVaults() {
  const vaults = useAppSelector(selectUserDepositedVaultIds);
  const [sortedVaults, setSortedVaults] = useState<VaultEntity['id'][]>(vaults);

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'none',
    sort: 'default',
  });

  const apyByVaultId = useAppSelector(state => state.biz.apy.totalApy.byVaultId);

  const userVaultsPnl = useAppSelector(selectUserVaultsPnl);

  useEffect(() => {
    const sortDirMul = sortedOptions.sortDirection === 'desc' ? -1 : 1;
    let sortedResult = sortedVaults;
    if (sortedOptions.sort === 'atDeposit') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const vaultPnl = userVaultsPnl[vaultId];
        return vaultPnl.usdBalanceAtDeposit.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'now') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const vaultPnl = userVaultsPnl[vaultId];
        return vaultPnl.depositUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'yield') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const vaultPnl = userVaultsPnl[vaultId];
        return vaultPnl.totalYieldUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'pnl') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const vaultPnl = userVaultsPnl[vaultId];
        return vaultPnl.totalPnlUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'apy') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const apy = apyByVaultId[vaultId];
        if (!apy) {
          return -1;
        }
        if (apy.boostedTotalApy !== undefined) {
          return sortDirMul * apy.boostedTotalApy;
        } else if (apy.totalApy !== undefined) {
          return sortDirMul * apy.totalApy;
        } else if (apy.vaultApr !== undefined) {
          return sortDirMul * apy.vaultApr;
        } else {
          throw new Error('Apy type not supported');
        }
      });
    }
    if (sortedOptions.sort === 'dailyYield') {
      sortedResult = sortBy(sortedVaults, vaultId => {
        const apy = apyByVaultId[vaultId];
        if (!apy) {
          return -1;
        }
        const { deposit, oraclePrice } = userVaultsPnl[vaultId];
        return sortDirMul * deposit.times(oraclePrice).times(apy.totalDaily).toNumber();
      });
    }

    setSortedVaults(sortedResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedOptions.sort, sortedOptions.sortDirection]);

  const handleSort = useCallback(
    field => {
      if (field === sortedOptions.sort) {
        setSortedOptions({
          ...sortedOptions,
          sortDirection: sortedOptions.sortDirection === 'asc' ? 'desc' : 'asc',
        });
      } else {
        setSortedOptions({ sort: field, sortDirection: 'desc' });
      }
    },
    [sortedOptions]
  );

  return { sortedVaults, sortedOptions, handleSort };
}
