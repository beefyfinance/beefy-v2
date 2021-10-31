import React, { useState, useEffect } from 'react';
import { Box, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { formatUsd } from 'helpers/format';
import styles from './styles';

const useStyles = makeStyles(styles);

const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    setEmpty(stats.deposited.eq(BigNumber(0)));
  }, [stats]);

  const BlurredText = ({ value }) => (
    <span className={blurred ? classes.blurred : ''}>{value}</span>
  );

  const formatStat = value => (empty ? '0' : formatUsd(value));

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('Portfolio-Deposited')}</Typography>
        <Typography className={classes.value}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.deposited)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('Portfolio-YieldMnth')}</Typography>
        <Typography className={classes.value}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.monthly)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('Portfolio-YieldDay')}</Typography>
        <Typography className={classes.value}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.daily)} />
        </Typography>
      </Box>
    </Grid>
  );
};

export default Stats;
