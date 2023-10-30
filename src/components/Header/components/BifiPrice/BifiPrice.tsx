import { makeStyles } from '@material-ui/core';
import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { formatBigUsd } from '../../../../helpers/format';
import type { BeefyState } from '../../../../redux-types';
import bifiToken from '../../../../images/single-assets/BIFI.png';

import { styles } from './styles';

const useStyles = makeStyles(styles);
export const _BifiPrice = connect((state: BeefyState) => {
  const beefyPrice = state.entities.tokens.prices.byOracleId['BIFI'] || BIG_ZERO;
  return { beefyPrice };
})(({ beefyPrice }: { beefyPrice: BigNumber }) => {
  const classes = useStyles();
  // TODO link directly to BIFI swap once 1inch supports new BIFI
  return (
    <a
      className={classes.bifiPrice}
      href="https://app.1inch.io/#/1/simple/swap/ETH"
      target="_blank"
      rel="noreferrer"
    >
      <img alt="BIFI" src={bifiToken} />
      {formatBigUsd(beefyPrice)}
    </a>
  );
});

export const BifiPrice = memo(_BifiPrice);
