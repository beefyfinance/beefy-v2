import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { Transaction, TransactionMobile } from './components/Transaction';
import { TransactionsFilter } from './components/TransactionsFilter';
import { useSortedTimeline } from './hook';

interface VaultTransactionsProps {
  vaultId: VaultEntity['id'];
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
}) {
  const classes = useStyles();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );

  const { sortedTimeline, sortedOptions, handleSort } = useSortedTimeline(vaultId);

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });

  const TxComponent = useMemo(() => {
    return smDown ? TransactionMobile : Transaction;
  }, [smDown]);

  return (
    <div className={classes.transactionsGrid}>
      <TransactionsFilter sortOptions={sortedOptions} handleSort={handleSort} />
      {sortedTimeline.map(tx => {
        return (
          <TxComponent
            key={tx.datetime.getTime()}
            tokenDecimals={depositToken.decimals}
            data={tx}
          />
        );
      })}
    </div>
  );
});
