import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { formatTokenDisplayCondensed } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { selectBridgeDepositTokenForChainId } from '../../../../../data/selectors/bridge';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet';
import { styles } from './styles';
import type { ChainEntity } from '../../../../../data/entities/chain';

const useStyles = makeStyles(styles);

interface BalanceEndAdornmentProps<V extends string = string> {
  value: V;
}

export const BalanceEndAdornment = memo(function BalanceEndAdornment({
  value: chainId,
}: BalanceEndAdornmentProps<ChainEntity['id']>) {
  const classes = useStyles();
  const token = useAppSelector(state => selectBridgeDepositTokenForChainId(state, chainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const showComponent = isWalletConnected && balance.isGreaterThan(BIG_ZERO);

  if (showComponent) {
    return (
      <div className={classes.balance}>
        {formatTokenDisplayCondensed(balance, token.decimals, 6)}
      </div>
    );
  }

  return null;
});
