import React from 'react';
import { Box, Hidden, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './styles';

const useStyles = makeStyles(styles);

const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const BlurredText = ({ value }) => {
    return <span className={blurred ? classes.blurred : ''}>{value}</span>;
  };

  return (
    <Box className={classes.stats}>
      <Box className={classes.stat}>
        <Typography className={classes.h2}>
          <BlurredText value={`$${stats.deposited.toFixed(2)}`} />
        </Typography>
        <Typography className={classes.body1}>{t('Portfolio-Deposited')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.h2}>
          <BlurredText value={'$0'} />
        </Typography>
        <Typography className={classes.body1}>{t('Portfolio-YieldTot')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.h2}>
          <BlurredText value={`$${stats.daily.toFixed(2)}`} />
        </Typography>
        <Typography className={classes.body1}>{t('Portfolio-YieldDay')}</Typography>
      </Box>
      <Hidden xsDown>
        <Box className={classes.stat}>
          <Typography className={classes.h2}>
            <BlurredText value={`$${stats.monthly.toFixed(2)}`} />
          </Typography>
          <Typography className={classes.body1}>{t('Portfolio-YieldMnth')}</Typography>
        </Box>
      </Hidden>
    </Box>
  );
};

export default Stats;
