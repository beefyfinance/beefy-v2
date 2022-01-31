import React, { useState, useEffect } from 'react';
import { Box, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { formatUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import { selectUserGlobalStats } from '../../../../data/selectors/apy';
import { BeefyState } from '../../../../redux/reducers/storev2';
import {
  selectIsConfigAvailable,
  selectIsPriceAvailable,
} from '../../../../data/selectors/data-loader';

const useStyles = makeStyles(styles as any);
export const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    setEmpty(stats.deposited.eq(new BigNumber(0)));
  }, [stats]);

  const BlurredText = ({ value }) => (
    <span className={blurred ? classes.blurred : ''}>{blurred ? '$100' : value}</span>
  );

  const formatStat = value => (empty ? new BigNumber(0).toFixed(0) : formatUsd(value.toNumber()));

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('Portfolio-Deposited')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <BlurredText value={formatStat(stats.deposited)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('Portfolio-YieldMnth')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <BlurredText value={formatStat(stats.monthly)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('Portfolio-YieldDay')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <BlurredText value={formatStat(stats.daily)} />
        </Typography>
      </Box>
    </Grid>
  );
};
