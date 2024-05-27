import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import React, { memo } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { Transaction, TransactionMobile } from './components/Transaction';
import { TransactionsFilter } from './components/TransactionsFilter';
import { useSortedTransactionHistory } from './hook';

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
      {sortedTimeline.map(tx => {
        return <TxComponent key={tx.transactionId} tx={tx} />;
      })}
    </div>
  );
});
