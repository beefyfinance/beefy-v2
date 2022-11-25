import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { formatBigUsd } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const _BifiPrice = connect((state: BeefyState) => {
  const beefyPrice = state.entities.tokens.prices.byOracleId['BIFI'] || BIG_ZERO;
  return { beefyPrice };
})(({ beefyPrice }: { beefyPrice: BigNumber }) => {
  const classes = useStyles();
  return (
    <a
      className={classes.bifiPrice}
      href="https://app.1inch.io/#/56/swap/BNB/BIFI"
      target="_blank"
      rel="noreferrer"
    >
      <img alt="BIFI" src={require(`../../../../images/bifi-logos/BIFI-TOKEN.svg`).default} />
      {formatBigUsd(beefyPrice)}
    </a>
  );
});

export const BifiPrice = memo(_BifiPrice);
