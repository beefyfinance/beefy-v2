import React, { useState, useEffect } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
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

  const valueClassName = `${classes.value} ${empty ? classes.obscured : ''}`;
  const labelClassName = `${classes.label} ${empty ? classes.obscured : ''}`;

  const formatStat = value => (empty ? '0' : formatUsd(value));

  return (
    <Box className={classes.stats}>
      <Box className={classes.stat}>
        <Typography className={labelClassName}>{t('Portfolio-Deposited')}</Typography>
        <Typography className={valueClassName}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.deposited)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={labelClassName}>{t('Portfolio-YieldMnth')}</Typography>
        <Typography className={valueClassName}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.monthly)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={labelClassName}>{t('Portfolio-YieldDay')}</Typography>
        <Typography className={valueClassName}>
          <BlurredText value={blurred ? `$100` : formatStat(stats.daily)} />
        </Typography>
      </Box>
    </Box>
  );
};

export default Stats;
