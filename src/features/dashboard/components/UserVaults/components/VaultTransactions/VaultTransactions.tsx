import { Fragment, memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { Transaction, TransactionMobile } from './components/Transaction/Transaction.tsx';
import { TransactionsFilter } from './components/TransactionsFilter/TransactionsFilter.tsx';
import { useSortedTransactionHistory } from './hook.ts';
import { TransactionTimelineSeparator } from './components/TransactionTimelineSeparator/TransactionTimelineSeparator.tsx';
import { css } from '@repo/styles/css';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

interface VaultTransactionsProps {
  vaultId: VaultEntity['id'];
  address: string;
}

const useStyles = legacyMakeStyles({
  transactionsGrid: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
  }),
});

export const VaultTransactions = memo(function VaultTransactions({
  vaultId,
  address,
}: VaultTransactionsProps) {
  const classes = useStyles();
  const { sortedTimeline, sortedOptions, handleSort } = useSortedTransactionHistory(
    vaultId,
    address
  );
  const isMobile = useBreakpoint({ to: 'sm' });
  const TxComponent = isMobile ? TransactionMobile : Transaction;

  return (
    <div className={classes.transactionsGrid}>
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      {sortedTimeline.map((tx, i) => (
        <Fragment key={tx.transactionId}>
          {(
            i > 0 &&
            i + 1 < sortedTimeline.length &&
            sortedOptions.sort === 'datetime' &&
            tx.timeline !== sortedTimeline[i - 1].timeline
          ) ?
            <TransactionTimelineSeparator />
          : null}
          <TxComponent tx={tx} />
        </Fragment>
      ))}
    </div>
  );
});
