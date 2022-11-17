import { orderBy, sortBy } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { shouldVaultShowInterest, VaultEntity } from '../../../data/entities/vault';
import { selectVaultsWithBalanceByChainId } from '../../../data/selectors/balance';

export type SortedOptions = {
  sort: 'apy' | 'daily' | 'default' | 'depositValue' | 'platform';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedVaults(vaults: VaultEntity[], chainId: ChainEntity['id']) {
  const [sortedVaults, setSortedVaults] = useState<VaultEntity[]>(vaults);
  const apyByVaultId = useAppSelector(state => state.biz.apy.totalApy.byVaultId);

  const vaultsWithBalance = useAppSelector(state =>
    selectVaultsWithBalanceByChainId(state, chainId)
  );

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'none',
    sort: 'default',
  });

  useEffect(() => {
    const sortDirMul = sortedOptions.sortDirection === 'desc' ? -1 : 1;
    let sortedResult = sortedVaults;
    if (sortedOptions.sort === 'apy') {
      sortedResult = sortBy(sortedVaults, vault => {
        if (!shouldVaultShowInterest(vault)) {
          return 0;
        }

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
    if (sortedOptions.sort === 'daily') {
      sortedResult = sortBy(sortedVaults, vault => {
        if (!shouldVaultShowInterest(vault)) {
          return 0;
        }

        const apy = apyByVaultId[vault.id];
        if (!apy) {
          return -1;
        }
        const balance = vaultsWithBalance[vault.id];
        return sortDirMul * balance.times(apy.totalDaily);
      });
    }
    if (sortedOptions.sort === 'platform') {
      sortedResult = orderBy(
        sortedVaults,
        ['platformId'],
        sortedOptions.sortDirection === 'none' ? 'asc' : sortedOptions.sortDirection
      );
    }
    if (sortedOptions.sort === 'depositValue') {
      sortedResult = sortBy(sortedVaults, vault => {
        const balance = vaultsWithBalance[vault.id];
        return sortDirMul * balance.toNumber();
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
