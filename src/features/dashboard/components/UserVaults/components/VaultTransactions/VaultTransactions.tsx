import { forwardRef, memo, type Ref, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectDashboardRowSideIds } from '../../../../../data/selectors/balance.ts';
import { shallowArrayEqual } from '../../../../../data/utils/selector-equality.ts';
import {
  CLM_SIDE_NAME,
  getClmSide,
} from '../../../../../vault/components/Actions/Transact/DepositFromVaultSelectList/groups.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { ToggleButtons } from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
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
import { type Components, GroupedVirtuoso, type ListProps } from 'react-virtuoso';
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

// virtuoso measures row-gap itself, so rows can be spaced like any other list
const listClass = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  rowGap: '2px',
});

const StyledList = memo(
  forwardRef(function (props: ListProps, ref: Ref<HTMLDivElement>) {
    return <div ref={ref} {...props} className={listClass} />;
  })
);

const components: Components<AnyTimelineEntry> = {
  List: StyledList,
};

export const VaultTransactions = memo(function VaultTransactions({
  vaultId,
  address,
}: VaultTransactionsProps) {
  const { t } = useTranslation();
  // a CLM row's wrappers keep separate timelines, so a row held on both sides picks one
  const sideIds = useAppSelector(state => selectDashboardRowSideIds(state, vaultId, address));
  const [pickedSide, setPickedSide] = useState<VaultEntity['id']>();
  const txVaultId = pickedSide && sideIds.includes(pickedSide) ? pickedSide : sideIds[0];
  const { sortedTimeline, sortedOptions, handleSort } = useSortedTransactionHistory(
    txVaultId,
    address
  );
  const isMobile = useBreakpoint({ to: 'sm' });
  const TxComponent = isMobile ? TransactionMobile : Transaction;
  const [listHeight, setListHeight] = useState(0);
  const containerHeight = Math.min(listHeight, 500);
  const { sort } = sortedOptions;
  const { groups, groupCounts } = useMemo((): GroupData => {
    if (sort === 'datetime') {
      const counts = countBy(sortedTimeline, tx => tx.timeline);
      const groups = keys(counts);
      if (groups.length > 1) {
        return { groups, groupCounts: Object.values(counts) };
      }
    }

    return { groups: ['all'], groupCounts: [sortedTimeline.length] };
  }, [sortedTimeline, sort]);

  const renderGroup = useCallback(
    (groupIndex: number) => {
      const isNote = groups[groupIndex] === 'past';
      return (
        <TransactionsGroup note={isNote}>
          {isNote ? t('Dashboard-Transactions-PastNote') : null}
        </TransactionsGroup>
      );
    },
    [groups, t]
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
      {sideIds.length > 1 ?
        <ClmSidePicker sideIds={sideIds} value={txVaultId} onChange={setPickedSide} />
      : null}
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      <Transactions style={{ height: `${containerHeight}px` }}>
        <GroupedVirtuoso
          className={scrollerClass}
          groupCounts={groupCounts}
          components={components}
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

type ClmSidePickerProps = {
  sideIds: VaultEntity['id'][];
  value: VaultEntity['id'];
  onChange: (sideId: VaultEntity['id']) => void;
};

/** the withdraw cards' names for the two sides */
const ClmSidePicker = memo(function ClmSidePicker({
  sideIds,
  value,
  onChange,
}: ClmSidePickerProps) {
  const { t } = useTranslation();
  const sides = useAppSelector(
    state => sideIds.map(id => getClmSide(selectVaultById(state, id))!),
    shallowArrayEqual
  );
  const options = useMemo(
    () => sideIds.map((id, i) => ({ value: id, label: t(CLM_SIDE_NAME[sides[i]]) })),
    [sideIds, sides, t]
  );
  return (
    <SidePicker>
      <ToggleButtons value={value} options={options} onChange={onChange} variant="filter" />
    </SidePicker>
  );
});

const SidePicker = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px',
    backgroundColor: 'background.content.dark',
  },
});

const Transactions = styled('div', {
  base: {
    maxHeight: '500px',
    mdDown: {
      // rows match what is behind them on mobile, so the gaps need their own ground
      backgroundColor: 'background.body',
    },
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
  variants: {
    note: {
      true: {
        textStyle: 'subline.sm',
        color: 'text.dark',
        textAlign: 'center',
        padding: '4px',
        // sticky, so it needs an opaque background
        backgroundColor: 'background.content.dark',
        mdDown: {
          backgroundColor: 'background.body',
        },
      },
      // virtuoso always renders a group header, so give it nothing to show
      false: {
        height: '1px',
        visibility: 'hidden',
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
