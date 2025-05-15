import { isBefore, subDays } from 'date-fns';
import { orderBy } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  type AnyTimelineEntry,
  isTimelineEntryStandard,
  type TimelineEntryCowcentratedPool,
  type TimelineEntryCowcentratedVault,
  type TimelineEntryStandard,
} from '../../../../../data/entities/analytics.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectUserFullTimelineEntriesByVaultId } from '../../../../../data/selectors/analytics.ts';
import { selectTokenPriceByAddress } from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';

export type SortedOptions = {
  sort: 'datetime' | 'amount' | 'balance' | 'mooTokenBal' | 'usdBalance';
  sortDirection: 'asc' | 'desc';
};

type VaultTransactionHistory = {
  sortedOptions: SortedOptions;
  handleSort: (field: SortedOptions['sort']) => void;
  sortedTimeline: (
    | TimelineEntryStandard
    | TimelineEntryCowcentratedPool
    | TimelineEntryCowcentratedVault
  )[];
};

export function useSortedTransactionHistory(
  vaultId: VaultEntity['id'],
  address: string
): VaultTransactionHistory {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const currentOraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const fullTimelineEntries = useAppSelector(state =>
    selectUserFullTimelineEntriesByVaultId(state, vaultId, address)
  );

  // Replace nulls with current price or 0
  const vaultTimelineFixed = useMemo(() => {
    if (!fullTimelineEntries) return [];

    const oneDayAgo = subDays(new Date(), 1);
    return fullTimelineEntries.map((row: AnyTimelineEntry) => {
      if (isTimelineEntryStandard(row) && !row.underlyingToUsdPrice) {
        const underlyingToUsdPrice =
          row.underlyingToUsdPrice ??
          (isBefore(row.datetime, oneDayAgo) ? BIG_ZERO : currentOraclePrice);

        return {
          ...row,
          underlyingToUsdPrice,
          usdBalance: row.underlyingBalance.times(underlyingToUsdPrice),
          usdDiff: row.underlyingDiff.times(underlyingToUsdPrice),
        };
      }

      return row;
    });
  }, [fullTimelineEntries, currentOraclePrice]);

  const [sortedOptions, setSortedOptions] = useState<SortedOptions>({
    sortDirection: 'desc',
    sort: 'datetime',
  });

  const sortedTimeline = useMemo(() => {
    switch (sortedOptions.sort) {
      case 'amount':
        return orderBy(
          vaultTimelineFixed,
          tx => tx.shareDiff.toNumber(),
          sortedOptions.sortDirection
        );
      case 'balance':
        return orderBy(
          vaultTimelineFixed,
          tx =>
            isTimelineEntryStandard(tx) ?
              tx.shareBalance.times(tx.shareToUnderlyingPrice).toNumber()
            : tx.usdBalance,
          sortedOptions.sortDirection
        );
      case 'mooTokenBal':
        return orderBy(
          vaultTimelineFixed,
          tx => tx.shareBalance.toNumber(),
          sortedOptions.sortDirection
        );
      case 'usdBalance':
        return orderBy(
          vaultTimelineFixed,
          tx => tx.usdBalance?.toNumber() || 0,
          sortedOptions.sortDirection
        );
      case 'datetime':
      default:
        return orderBy(
          vaultTimelineFixed,
          [tx => tx.datetime.getTime()],
          [sortedOptions.sortDirection]
        );
    }
  }, [sortedOptions.sort, sortedOptions.sortDirection, vaultTimelineFixed]);

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

  return { sortedTimeline, sortedOptions, handleSort };
}
