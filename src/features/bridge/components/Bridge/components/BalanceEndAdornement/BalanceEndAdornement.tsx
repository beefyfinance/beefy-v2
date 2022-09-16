import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { selectBifiAddress } from '../../../../../data/selectors/bridge';
import { selectChainById } from '../../../../../data/selectors/chains';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface BalanceEndAdornementProps {
  value: string;
}

export const BalanceEndAdornement = memo<BalanceEndAdornementProps>(function ({ value }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, value));

  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const BifiAddress = useAppSelector(state => selectBifiAddress(state, chain));

  const bifiBalance = useAppSelector(state =>
    BifiAddress ? selectUserBalanceOfToken(state, chain.id, BifiAddress) : BIG_ZERO
  );

  const showComponent = isWalletConnected && bifiBalance.isGreaterThan(BIG_ZERO);

  return (
    showComponent && <div className={classes.balance}>{formatBigDecimals(bifiBalance, 4)}</div>
  );
});
