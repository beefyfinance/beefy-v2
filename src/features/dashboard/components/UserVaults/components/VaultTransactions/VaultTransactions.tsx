import { Fragment, memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { Transaction, TransactionMobile } from './components/Transaction';
import { TransactionsFilter } from './components/TransactionsFilter';
import { useSortedTransactionHistory } from './hook';
import { TransactionTimelineSeparator } from './components/TransactionTimelineSeparator/TransactionTimelineSeparator';

interface VaultTransactionsProps {
  vaultId: VaultEntity['id'];
  address: string;
}

const useStyles = makeStyles(() => ({
  transactionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
  },
}));

export const VaultTransactions = memo<VaultTransactionsProps>(function VaultTransactions({
  vaultId,
  address,
}) {
  const classes = useStyles();
  const { sortedTimeline, sortedOptions, handleSort } = useSortedTransactionHistory(
    vaultId,
    address
  );
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });
  const TxComponent = isMobile ? TransactionMobile : Transaction;

  return (
    <div className={classes.transactionsGrid}>
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      {sortedTimeline.map((tx, i) => (
        <Fragment key={tx.transactionId}>
          {i > 0 &&
          i + 1 < sortedTimeline.length &&
          sortedOptions.sort === 'datetime' &&
          tx.timeline !== sortedTimeline[i - 1].timeline ? (
            <TransactionTimelineSeparator />
          ) : null}
          <TxComponent tx={tx} />
        </Fragment>
      ))}
    </div>
  );
});
