import { sortBy } from 'lodash-es';
import { useState, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { selectUserDepositedTimelineByVaultId } from '../../../../../data/selectors/analytics';

export type SortedOptions = {
  sort: 'datetime' | 'amount' | 'balance' | 'mooTokenBal' | 'usdBalance' | 'default';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedTimeline(vaultId: VaultEntity['id']) {
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'none',
    sort: 'default',
  });

  const sortedTimeline = useMemo(() => {
    const sortDirMul = sortedOptions.sortDirection === 'desc' ? -1 : 1;
    let sortedResult = vaultTimeline;
    if (sortedOptions.sort === 'datetime') {
      sortedResult = sortBy(vaultTimeline, tx => {
        return tx.datetime.getTime() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'amount') {
      sortedResult = sortBy(vaultTimeline, tx => {
        return tx.shareDiff.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'balance') {
      sortedResult = sortBy(vaultTimeline, tx => {
        return tx.shareBalance.times(tx.shareToUnderlyingPrice).toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'mooTokenBal') {
      sortedResult = sortBy(vaultTimeline, tx => {
        return tx.shareBalance.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'usdBalance') {
      sortedResult = sortBy(vaultTimeline, tx => {
        return tx.usdBalance?.toNumber() * sortDirMul;
      });
    }

    return sortedResult;
  }, [sortedOptions.sort, sortedOptions.sortDirection, vaultTimeline]);

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

  return { sortedTimeline, sortedOptions, handleSort };
}
