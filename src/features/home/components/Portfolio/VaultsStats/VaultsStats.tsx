import { useState, useCallback } from 'react';
import { Box, Grid, makeStyles, Modal, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StatLoader } from '../../../../../components/StatLoader';
import { formatBigUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { selectTotalTvl } from '../../../../data/selectors/tvl';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults';
import { selectTotalBuybackUsdAmount } from '../../../../data/selectors/buyback';
import { ModalTvl } from '../ModalTvl';
import { backdropStyle } from '../../../../../helpers/styleUtils';

const useStyles = makeStyles(styles as any);
export const VaultsStats = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const classes = useStyles();
  const t = useTranslation().t;
  const totalTvl = useSelector(selectTotalTvl);
  const totalActiveVaults = useSelector(selectTotalActiveVaults);
  const buyback = useSelector(selectTotalBuybackUsdAmount);
  const ValueText = ({ value }) => <>{value ? <span>{value}</span> : <StatLoader />}</>;

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Box className={classes.flex}>
          <Typography variant="body1" className={classes.label}>
            {t('TVL')}
          </Typography>
          <Box className={classes.flex} onClick={handleOpen}>
            <img
              className={classes.icon}
              src={require('../../../../../images/i.svg').default}
              alt="i"
            />
          </Box>
        </Box>
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
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        BackdropProps={{ style: { ...backdropStyle } }}
        onClose={() => setIsOpen(false)}
      >
        <ModalTvl close={() => setIsOpen(false)} />
      </Modal>
    </Grid>
  );
};
