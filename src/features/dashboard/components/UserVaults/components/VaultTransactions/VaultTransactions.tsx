import { makeStyles, Theme, useMediaQuery } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { Transaction, TransactionMobile } from './components/Transaction';
import { TransactionsFilter } from './components/TransactionsFilter';
import { useSortedTimeline } from './hook';

interface VaultTransactionsProps {
  vaultId: VaultEntity['id'];
}

const useStyles = makeStyles((theme: Theme) => ({
  transactionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
  },
}));

export const VaultTransactions = memo<VaultTransactionsProps>(function ({ vaultId }) {
  const classes = useStyles();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const token = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );

  const { sortedTimeline, sortedOptions, handleSort } = useSortedTimeline(vaultId);

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const TxComponent = useMemo(() => {
    return smDown ? TransactionMobile : Transaction;
  }, [smDown]);

  return (
    <div className={classes.transactionsGrid}>
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      {sortedTimeline.map(tx => {
        return <TxComponent key={tx.datetime.getTime()} tokenDecimals={token.decimals} data={tx} />;
      })}
    </div>
  );
});
