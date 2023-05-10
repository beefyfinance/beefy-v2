import { sortBy } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../../../store';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { selectUserDepositedTimelineByVaultId } from '../../../../../data/selectors/analytics';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectTokenPriceByAddress } from '../../../../../data/selectors/tokens';
import { isBefore, subDays } from 'date-fns';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

export type SortedOptions = {
  sort: 'datetime' | 'amount' | 'balance' | 'mooTokenBal' | 'usdBalance' | 'default';
  sortDirection: 'asc' | 'desc' | 'none';
};

export function useSortedTimeline(vaultId: VaultEntity['id']) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const currentOraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  // Replace nulls with current price or 0
  const vaultTimelineFixed = useMemo(() => {
    const oneDayAgo = subDays(new Date(), 1);
    return vaultTimeline.map(row => {
      if (!row.underlyingToUsdPrice) {
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
  }, [vaultTimeline, currentOraclePrice]);

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
  }, [sortedOptions.sort, sortedOptions.sortDirection, vaultTimelineFixed]);

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
