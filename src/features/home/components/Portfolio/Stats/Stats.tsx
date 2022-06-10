import { useEffect, useState } from 'react';
import { Box, Grid, Hidden, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatApy, formatUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { BIG_ZERO } from '../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    setEmpty(stats.deposited.isZero());
  }, [stats]);

  const BlurredText = ({ value }) => (
    <span className={blurred ? classes.blurred : ''}>{blurred ? '$100' : value}</span>
  );

  const formatStat = value => (empty ? BIG_ZERO.toFixed(0) : formatUsd(value.toNumber()));

  return (
    <Grid container className={classes.userStats}>
      <Box className={classes.stat}>
        <div className={classes.label}>{t('Portfolio-Deposited')}</div>
        <div className={classes.value}>
          <BlurredText value={formatStat(stats.deposited)} />
        </div>
      </Box>
      <Box className={classes.stat}>
        <div className={classes.label}>{t('Portfolio-YieldMnth')}</div>
        <div className={classes.value}>
          <BlurredText value={formatStat(stats.monthly)} />
        </div>
      </Box>
      <Hidden xsDown>
        <Box className={classes.stat}>
          <div className={classes.label}>{t('Portfolio-YieldDay')}</div>
          <div className={classes.value}>
            <BlurredText value={formatStat(stats.daily)} />
          </div>
        </Box>
        <Box className={classes.stat}>
          <div className={classes.label}>{t('Portfolio-AvgAPY')}</div>
          <div className={classes.value}>
            <BlurredText value={formatApy(stats.apy.toNumber(), 2, '0%')} />
          </div>
        </Box>
      </Hidden>
    </Grid>
  );
};
