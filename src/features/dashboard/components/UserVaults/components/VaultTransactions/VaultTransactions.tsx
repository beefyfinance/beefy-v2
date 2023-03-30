import { makeStyles, Theme } from '@material-ui/core';
import React, { memo } from 'react';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectUserDepositedTimelineByVaultId } from '../../../../../data/selectors/analytics';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { Transaction } from './components/Transaction';
import { TransactionsFilter } from './components/TransactionsFilter';

interface VaultTransactionsProps {
  vaultId: VaultEntity['id'];
}

const useStyles = makeStyles((theme: Theme) => ({
  transactionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
    '& > :last-child': {
      borderRadius: ' 0px 0px 8px 8px',
    },
  },
}));

export const VaultTransactions = memo<VaultTransactionsProps>(function ({ vaultId }) {
  const classes = useStyles();
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const token = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <div className={classes.transactionsGrid}>
      <TransactionsFilter />
      {vaultTimeline.map(tx => {
        return <Transaction key={tx.datetime.getTime()} tokenDecimals={token.decimals} data={tx} />;
      })}
    </div>
  );
});
