import { orderBy } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { isVaultActive } from '../../../data/entities/vault.ts';
import { isUserClmPnl } from '../../../data/selectors/analytics-types.ts';
import {
  selectDashboardUserVaultsDailyYield,
  selectDashboardUserVaultsPnl,
} from '../../../data/selectors/dashboard.ts';
import { selectUserDashboardFilteredVaults } from '../../../data/selectors/filtered-vaults.ts';

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

  const filteredVaults = useAppSelector(state =>
    selectUserDashboardFilteredVaults(state, searchText, address)
  );

  const apyByVaultId = useAppSelector(state => state.biz.apy.totalApy.byVaultId);

  const userVaultsPnl = useAppSelector(state => selectDashboardUserVaultsPnl(state, address));

  const userVaultsDailyYield = useAppSelector(state =>
    selectDashboardUserVaultsDailyYield(state, address)
  );

  const sortedFilteredVaults = useMemo(() => {
    return (
      sortedOptions.sort === 'default' ?
        filteredVaults
      : orderBy(
          filteredVaults,
          vault => {
            const vaultPnl = userVaultsPnl[vault.id];
            const apy = apyByVaultId[vault.id];
            const vaultDailyYield = userVaultsDailyYield[vault.id];

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
                if (!isVaultActive(vault) || !vaultDailyYield) {
                  return -1;
                }
                return vaultDailyYield.toNumber();
              }
            }
          },
          sortedOptions.sortDirection
        )).map(vault => vault.id);
  }, [
    sortedOptions.sortDirection,
    sortedOptions.sort,
    filteredVaults,
    userVaultsPnl,
    apyByVaultId,
    userVaultsDailyYield,
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
    searchText,
    setSearchText,
  };
}
