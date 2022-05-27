import { useCallback, useState } from 'react';
import { Box, Grid, makeStyles, Modal } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ApyStatLoader } from '../../../../../components/ApyStatLoader';
import { formatBigUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { selectTotalTvl } from '../../../../data/selectors/tvl';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults';
import { selectTotalBuybackUsdAmount } from '../../../../data/selectors/buyback';
import { ModalTvl } from '../ModalTvl';

const useStyles = makeStyles(styles);

export const VaultsStats = () => {
  const [isTvlModalOpen, setIsTvlModalOpen] = useState<boolean>(false);
  const classes = useStyles();
  const t = useTranslation().t;
  const totalTvl = useSelector(selectTotalTvl);
  const totalActiveVaults = useSelector(selectTotalActiveVaults);
  const buyback = useSelector(selectTotalBuybackUsdAmount);
  const ValueText = ({ value }) => <>{value ? <span>{value}</span> : <ApyStatLoader />}</>;

  const handleTvlModalOpen = useCallback(() => {
    setIsTvlModalOpen(true);
  }, [setIsTvlModalOpen]);

  const handleTvlModalClose = useCallback(() => {
    setIsTvlModalOpen(false);
  }, [setIsTvlModalOpen]);

  return (
    <Grid container className={classes.stats}>
      <Box className={classes.stat}>
        <Box className={classes.labelWithIcon}>
          <div className={classes.label}>{t('TVL')}</div>
          <div onClick={handleTvlModalOpen}>
            <img
              className={classes.icon}
              src={require('../../../../../images/i.svg').default}
              alt="i"
            />
          </div>
        </Box>
        <div className={classes.value}>
          <ValueText value={formatBigUsd(totalTvl)} />
        </div>
      </Box>
      <Box className={classes.stat}>
        <div className={classes.label}>{t('Vaults-Title')}</div>
        <div className={classes.value}>
          <ValueText value={totalActiveVaults} />
        </div>
      </Box>
      <Box className={classes.stat}>
        <div className={classes.label}>{t('BuyBack')}</div>
        <div className={classes.value}>
          <ValueText value={formatBigUsd(buyback)} />
        </div>
      </Box>
      <Modal open={isTvlModalOpen} onClose={handleTvlModalClose}>
        <ModalTvl close={handleTvlModalClose} />
      </Modal>
    </Grid>
  );
};
