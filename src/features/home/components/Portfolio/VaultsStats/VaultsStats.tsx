import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';
import { useVaults } from '../../../hooks/useFilteredVaults';
import { useSelector } from 'react-redux';
import { ApyStatLoader } from '../../../../../components/ApyStatLoader';
import { useBuyback } from '../../../hooks/useBuyback';
import { formatUsd } from '../../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const VaultsStats = ({ stats, blurred }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const { activeVaults } = useVaults();
  const totalTvl = useSelector((state: any) => state.vaultReducer.totalTvl.toNumber());

  const buyback = useBuyback();

  const ValueText = ({ value }) => <>{value ? <span>{value}</span> : <ApyStatLoader />}</>;

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('TVL')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={totalTvl ? formatUsd(totalTvl) : 0} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('Vaults-Title')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={activeVaults} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('BuyBack')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={buyback ? formatUsd(buyback) : 0} />
        </Typography>
      </Box>
    </Grid>
  );
};
