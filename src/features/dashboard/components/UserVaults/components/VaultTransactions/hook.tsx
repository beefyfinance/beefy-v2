import { sortBy } from 'lodash';
import { useState, useEffect, useCallback } from 'react';
import { VaultTimelineAnalyticsEntity } from '../../../../../data/entities/analytics';

export type SortedOptions = {
  sort: 'datetime' | 'amount' | 'balance' | 'mooTokenBal' | 'usdBalance' | 'default';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedTimeline(timeline: VaultTimelineAnalyticsEntity[]) {
  const [sortedTimeline, setSortedTimeline] = useState<VaultTimelineAnalyticsEntity[]>(timeline);

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'none',
    sort: 'default',
  });

  useEffect(() => {
    const sortDirMul = sortedOptions.sortDirection === 'desc' ? -1 : 1;
    let sortedResult = sortedTimeline;
    if (sortedOptions.sort === 'datetime') {
      sortedResult = sortBy(sortedTimeline, tx => {
        return tx.datetime.getTime() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'amount') {
      sortedResult = sortBy(sortedTimeline, tx => {
        return tx.shareDiff.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'balance') {
      sortedResult = sortBy(sortedTimeline, tx => {
        return tx.shareBalance.times(tx.shareToUnderlyingPrice).toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'mooTokenBal') {
      sortedResult = sortBy(sortedTimeline, tx => {
        return tx.shareBalance.toNumber() * sortDirMul;
      });
    }
    if (sortedOptions.sort === 'usdBalance') {
      sortedResult = sortBy(sortedTimeline, tx => {
        return tx.usdBalance?.toNumber() * sortDirMul;
      });
    }

    setSortedTimeline(sortedResult);
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

  return { sortedTimeline, sortedOptions, handleSort };
}
