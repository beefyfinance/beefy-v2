import { memo, useCallback, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { Transaction, TransactionMobile } from './components/Transaction/Transaction.tsx';
import { TransactionsFilter } from './components/TransactionsFilter/TransactionsFilter.tsx';
import { useSortedTransactionHistory } from './hook.ts';
import { css } from '@repo/styles/css';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import type {
  TimelineEntryCowcentratedPool,
  TimelineEntryCowcentratedVault,
  TimelineEntryStandard,
} from '../../../../../data/entities/analytics.ts';
import { GroupedVirtuoso } from 'react-virtuoso';
import { styled } from '@repo/styles/jsx';
import { countBy } from '../../../../../../helpers/collection.ts';
import { keys } from '../../../../../../helpers/object.ts';

type VaultTransactionsProps = {
  vaultId: VaultEntity['id'];
  address: string;
};

type AnyTimelineEntry =
  | TimelineEntryStandard
  | TimelineEntryCowcentratedPool
  | TimelineEntryCowcentratedVault;

type GroupKey = AnyTimelineEntry['timeline'] | 'all';
type GroupData = {
  groups: GroupKey[];
  groupCounts: number[];
};

const scrollerClass = css({
  scrollbarWidth: 'thin',
  scrollbarColor: '{colors.darkBlue.50} {colors.darkBlue.70}',
});

const increaseViewportBy = { top: 50, bottom: 50 };

export const VaultTransactions = memo(function VaultTransactions({
  vaultId,
  address,
}: VaultTransactionsProps) {
  const { sortedTimeline, sortedOptions, handleSort } = useSortedTransactionHistory(
    vaultId,
    address
  );
  const isMobile = useBreakpoint({ to: 'sm' });
  const TxComponent = isMobile ? TransactionMobile : Transaction;
  const [listHeight, setListHeight] = useState(0);
  const containerHeight = Math.min(listHeight, 500);
  const { sort } = sortedOptions;
  const { groups, groupCounts } = useMemo((): GroupData => {
    if (sort !== 'datetime') {
      return {
        groups: ['all'],
        groupCounts: [sortedTimeline.length],
      };
    }

    const counts = countBy(sortedTimeline, tx => tx.timeline);
    return {
      groups: keys(counts),
      groupCounts: Object.values(counts),
    };
  }, [sortedTimeline, sort]);

  const renderGroup = useCallback(
    (groupIndex: number) => {
      const group = groups[groupIndex];
      return <TransactionsGroup group={group}>{group}</TransactionsGroup>;
    },
    [groups]
  );
  const renderItem = useCallback(
    (index: number, _groupIndex: number) => {
      const tx = sortedTimeline[index];
      return <TxComponent tx={tx} />;
    },
    [TxComponent, sortedTimeline]
  );

  return (
    <TransactionsGrid>
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      <Transactions style={{ height: `${containerHeight}px` }}>
        <GroupedVirtuoso
          className={scrollerClass}
          groupCounts={groupCounts}
          totalListHeightChanged={setListHeight}
          groupContent={renderGroup}
          itemContent={renderItem}
          computeItemKey={computeItemKey}
          increaseViewportBy={increaseViewportBy}
        />
      </Transactions>
    </TransactionsGrid>
  );
});

const Transactions = styled('div', {
  base: {
    maxHeight: '500px',
  },
});

const TransactionsGrid = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
});

const TransactionsGroup = styled('div', {
  base: {
    padding: '8px 16px',
    backgroundColor: 'darkBlue.60',
    textStyle: 'subline.sm.semiBold',
  },
  variants: {
    group: {
      current: {},
      past: {},
      all: {
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        visibility: 'hidden',
        pointerEvents: 'none',
      },
    },
  },
});

function computeItemKey(index: number, tx: AnyTimelineEntry) {
  if (!tx) {
    return `group-header-${index}`;
  }
  return tx.transactionId;
}
