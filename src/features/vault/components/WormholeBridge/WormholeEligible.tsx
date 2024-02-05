import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';
import { selectWormholeBalance } from '../../../data/selectors/balance';
import { formatBigDecimals } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

export const WormholeEligible = memo(function WormholeEligible() {
  const classes = useStyles();
  const wormhole = useAppSelector(state => selectWormholeBalance(state));

  return (
    <div className={classes.notice}>
      {formatBigDecimals(wormhole.bridged)} eligible USDC bridged via Wormhole
    </div>
  );
});
