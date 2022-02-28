import { useState, useEffect } from 'react';
import { Box, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO, formatUsd } from '../../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    setEmpty(stats.deposited.isZero());
  }, [stats]);

  const BlurredText = ({ value }) => (
    <span className={blurred ? classes.blurred : ''}>{blurred ? '$100' : value}</span>
  );

  const formatStat = value => (empty ? BIG_ZERO.toFixed(0) : formatUsd(value.toNumber()));

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
