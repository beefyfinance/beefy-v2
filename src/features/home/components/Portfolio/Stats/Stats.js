import React, { useState, useEffect } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

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

  const valueClassName = `${classes.value} ${empty ? classes.obscured : ''}`;
  const labelClassName = `${classes.label} ${empty ? classes.obscured : ''}`;

  const formatStat = value => (empty ? '0' : `$${value.toFixed(2)}`);

  return (
    <Box className={classes.stats}>
      <Box className={classes.stat}>
        <Typography className={valueClassName}>
          <BlurredText value={formatStat(stats.deposited)} />
        </Typography>
        <Typography className={labelClassName}>{t('Portfolio-Deposited')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={valueClassName}>
          <BlurredText value={formatStat(stats.monthly)} />
        </Typography>
        <Typography className={labelClassName}>{t('Portfolio-YieldMnth')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={valueClassName}>
          <BlurredText value={formatStat(stats.daily)} />
        </Typography>
        <Typography className={labelClassName}>{t('Portfolio-YieldDay')}</Typography>
      </Box>
    </Box>
  );
};

export default Stats;
