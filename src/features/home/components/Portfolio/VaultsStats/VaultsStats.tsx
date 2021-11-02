import React from 'react';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useVaults } from '../../../hooks/useFilteredVaults';
import { useSelector } from 'react-redux';
import { ApyLoader } from '../../../../../components/ApyLoader';
import { useBuyback } from '../../../hooks/useBuyback';
import { formatUsd } from '../../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const VaultsStats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const [, , , , , activeVaults] = useVaults();
  const totalTvl = useSelector(state => state.vaultReducer.totalTvl.toNumber());

  const buyback = useBuyback();

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyLoader />}</>
  );

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('TVL')}</Typography>
        <Typography>
          <ValueText value={totalTvl ? formatUsd(totalTvl) : 0} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('Vaults-Title')}</Typography>
        <Typography>
          <ValueText value={activeVaults} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.label}>{t('BuyBack')}</Typography>
        <Typography>
          <ValueText value={buyback ? formatUsd(buyback) : 0} />
        </Typography>
      </Box>
    </Grid>
  );
};
