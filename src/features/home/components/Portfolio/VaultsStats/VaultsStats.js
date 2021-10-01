import React, { useState } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useVaults from 'features/home/hooks/useFilteredVaults';
import { useSelector } from 'react-redux';
import ApyLoader from 'components/APYLoader';

import { formatUsd } from 'helpers/format';
import styles from './styles';

const useStyles = makeStyles(styles);

const Stats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const data = useVaults();
  const totalTvl = useSelector(state => state.vaultReducer.totalTvl.toNumber());

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyLoader />}</>
  );

  return (
    <Box className={classes.stats}>
      <Box className={classes.stat}>
        <Typography>
          <ValueText value={totalTvl ? formatUsd(totalTvl) : 0} />
        </Typography>
        <Typography className={classes.label}>{t('TVL')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography>
          <ValueText value={data[4]} />
        </Typography>
        <Typography className={classes.label}>{t('Vaults-Title')}</Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography>
          <ValueText value={0} />
        </Typography>
        <Typography className={classes.label}>{t('BuyBack')}</Typography>
      </Box>
    </Box>
  );
};

export default Stats;
