import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { selectBridgeDepositTokenForChainId } from '../../../../../data/selectors/bridge';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface BalanceEndAdornmentProps {
  value: string;
}

export const BalanceEndAdornment = memo<BalanceEndAdornmentProps>(function BalanceEndAdornment({
  value: chainId,
}) {
  const classes = useStyles();
  const token = useAppSelector(state => selectBridgeDepositTokenForChainId(state, chainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const showComponent = isWalletConnected && balance.isGreaterThan(BIG_ZERO);

  if (showComponent) {
    return <div className={classes.balance}>{formatBigDecimals(balance, 4)}</div>;
  }

  return null;
});
