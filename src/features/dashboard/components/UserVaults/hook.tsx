import { sortBy } from 'lodash-es';
import { useState, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserVaultsPnl } from '../../../data/selectors/balance';
import { selectUserFilteredVaults } from '../../../data/selectors/filtered-vaults';

export type SortedOptions = {
  sort: 'atDeposit' | 'now' | 'yield' | 'pnl' | 'apy' | 'dailyYield' | 'default';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedDashboardVaults() {
  const [searchText, setSearchText] = useState('');

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'desc',
    sort: 'now',
  });

  const handleSearchText = useCallback(e => setSearchText(e.target.value), []);

  const handleClearText = useCallback(() => {
    setSearchText('');
  }, []);

  const filteredVaults = useAppSelector(state => selectUserFilteredVaults(state, searchText));

  const apyByVaultId = useAppSelector(state => state.biz.apy.totalApy.byVaultId);

  const userVaultsPnl = useAppSelector(selectUserVaultsPnl);

  const sortedFilteredVaults = useMemo(() => {
    const sortDirMul = sortedOptions.sortDirection === 'desc' ? -1 : 1;
    let sortedResult = filteredVaults;
    if (sortedOptions.sort === 'atDeposit') {
      sortedResult = sortBy(filteredVaults, vault => {
        const vaultPnl = userVaultsPnl[vault.id];
        return vaultPnl.usdBalanceAtDeposit.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'now') {
      sortedResult = sortBy(filteredVaults, vault => {
        const vaultPnl = userVaultsPnl[vault.id];
        return vaultPnl.depositUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'yield') {
      sortedResult = sortBy(filteredVaults, vault => {
        const vaultPnl = userVaultsPnl[vault.id];
        return vaultPnl.totalYieldUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'pnl') {
      sortedResult = sortBy(filteredVaults, vault => {
        const vaultPnl = userVaultsPnl[vault.id];
        return vaultPnl.totalPnlUsd.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'apy') {
      sortedResult = sortBy(filteredVaults, vault => {
        const apy = apyByVaultId[vault.id];
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
      sortedResult = sortBy(filteredVaults, vault => {
        const apy = apyByVaultId[vault.id];
        if (!apy) {
          return -1;
        }
        const { deposit, oraclePrice } = userVaultsPnl[vault.id];
        return sortDirMul * deposit.times(oraclePrice).times(apy.totalDaily).toNumber();
      });
    }
    return sortedResult;
  }, [
    sortedOptions.sortDirection,
    sortedOptions.sort,
    filteredVaults,
    userVaultsPnl,
    apyByVaultId,
  ]);

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

  return {
    sortedFilteredVaults,
    sortedOptions,
    handleSort,
    handleSearchText,
    searchText,
    handleClearText,
  };
}
