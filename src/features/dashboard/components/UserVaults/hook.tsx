import { orderBy } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserDashboardFilteredVaults } from '../../../data/selectors/filtered-vaults';
import { isUserClmPnl } from '../../../data/selectors/analytics-types';
import { isVaultActive } from '../../../data/entities/vault';
import { selectDashboardUserVaultsPnl } from '../../../data/selectors/dashboard';

export type SortedOptions = {
  sort: 'atDeposit' | 'now' | 'yield' | 'pnl' | 'apy' | 'dailyYield' | 'default';
  sortDirection: 'asc' | 'desc';
};

export function useSortedDashboardVaults(address: string) {
  const [searchText, setSearchText] = useState<string>('');

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'desc',
    sort: 'now',
  });

  const handleSearchText = useCallback(e => setSearchText(e.target.value), [setSearchText]);

  const handleClearText = useCallback(() => {
    setSearchText('');
  }, [setSearchText]);

  const filteredVaults = useAppSelector(state =>
    selectUserDashboardFilteredVaults(state, searchText, address)
  );

  const apyByVaultId = useAppSelector(state => state.biz.apy.totalApy.byVaultId);

  const userVaultsPnl = useAppSelector(state => selectDashboardUserVaultsPnl(state, address));

  const sortedFilteredVaults = useMemo(() => {
    return sortedOptions.sort === 'default'
      ? filteredVaults
      : orderBy(
          filteredVaults,
          vault => {
            const vaultPnl = userVaultsPnl[vault.id];
            const apy = apyByVaultId[vault.id];
            switch (sortedOptions.sort) {
              case 'atDeposit': {
                if (isUserClmPnl(vaultPnl)) {
                  return vaultPnl.underlying.entry.usd.toNumber();
                }
                return vaultPnl.usdBalanceAtDeposit.toNumber();
              }
              case 'now': {
                if (isUserClmPnl(vaultPnl)) {
                  return vaultPnl.underlying.now.usd.toNumber();
                }
                return vaultPnl.depositUsd.toNumber();
              }
              case 'yield': {
                if (isUserClmPnl(vaultPnl)) {
                  return vaultPnl.yields.usd.toNumber();
                }
                return vaultPnl.totalYieldUsd.toNumber();
              }
              case 'pnl': {
                if (isUserClmPnl(vaultPnl)) {
                  return vaultPnl.pnl.withClaimedPending.usd.toNumber();
                }
                return vaultPnl.totalPnlUsd.toNumber();
              }
              case 'apy': {
                if (!isVaultActive(vault) || !apy) {
                  return -1;
                }
                if (apy.boostedTotalApy !== undefined) {
                  return apy.boostedTotalApy;
                } else if (apy.totalApy !== undefined) {
                  return apy.totalApy;
                } else if (apy.vaultApr !== undefined) {
                  return apy.vaultApr;
                } else {
                  throw new Error('Apy type not supported');
                }
              }
              case 'dailyYield': {
                if (!isVaultActive(vault) || !apy) {
                  return -1;
                }
                if (isUserClmPnl(vaultPnl)) {
                  return vaultPnl.underlying.now.usd.times(apy.totalDaily).toNumber();
                }
                return vaultPnl.deposit
                  .times(vaultPnl.oraclePrice)
                  .times(apy.totalDaily)
                  .toNumber();
              }
            }
          },
          sortedOptions.sortDirection
        );
  }, [
    sortedOptions.sortDirection,
    sortedOptions.sort,
    filteredVaults,
    userVaultsPnl,
    apyByVaultId,
  ]);

  const handleSort = useCallback(
    (field: SortedOptions['sort']) => {
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
