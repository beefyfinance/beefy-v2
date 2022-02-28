import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ApyStatLoader } from '../../../../../components/ApyStatLoader';
import { formatBigUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { selectTotalTvl } from '../../../../data/selectors/tvl';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults';
import { selectTotalBuybackUsdAmount } from '../../../../data/selectors/buyback';

const useStyles = makeStyles(styles as any);
export const VaultsStats = () => {
  const classes = useStyles();
  const t = useTranslation().t;
  const totalTvl = useSelector(selectTotalTvl);
  const totalActiveVaults = useSelector(selectTotalActiveVaults);
  const buyback = useSelector(selectTotalBuybackUsdAmount);
  const ValueText = ({ value }) => <>{value ? <span>{value}</span> : <ApyStatLoader />}</>;

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('TVL')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={formatBigUsd(totalTvl)} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('Vaults-Title')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={totalActiveVaults} />
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography variant="body1" className={classes.label}>
          {t('BuyBack')}
        </Typography>
        <Typography variant="h3" className={classes.value}>
          <ValueText value={formatBigUsd(buyback)} />
        </Typography>
      </Box>
    </Grid>
  );
};
