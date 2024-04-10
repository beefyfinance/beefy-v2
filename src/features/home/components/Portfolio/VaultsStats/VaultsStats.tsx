import { useCallback, useState } from 'react';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd } from '../../../../../helpers/format';
import { StatLoader } from '../../../../../components/StatLoader';
import { styles } from './styles';
import { selectTotalTvl } from '../../../../data/selectors/tvl';
import { selectTotalActiveVaults } from '../../../../data/selectors/vaults';
import { ModalTvl } from '../ModalTvl';
import { useAppSelector } from '../../../../../store';
import { Modal } from '../../../../../components/Modal';
import infoIcon from '../../../../../images/icons/i.svg';

const useStyles = makeStyles(styles);
export const VaultsStats = () => {
  const [isTvlModalOpen, setIsTvlModalOpen] = useState<boolean>(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const totalTvl = useAppSelector(selectTotalTvl);
  const totalActiveVaults = useAppSelector(selectTotalActiveVaults);
  const ValueText = ({ value }) => <>{value ? <span>{value}</span> : <StatLoader />}</>;

  const handleTvlModalOpen = useCallback(() => {
    setIsTvlModalOpen(true);
  }, [setIsTvlModalOpen]);

  const handleTvlModalClose = useCallback(() => {
    setIsTvlModalOpen(false);
  }, [setIsTvlModalOpen]);

  return (
    <Grid container className={classes.userStats}>
      <Box className={classes.stat}>
        <Box className={classes.labelWithIcon}>
          <div className={classes.label}>{t('TVL')}</div>
          <div onClick={handleTvlModalOpen}>
            <img className={classes.icon} src={infoIcon} alt="i" />
          </div>
        </Box>
        <div className={classes.value}>
          <ValueText value={formatLargeUsd(totalTvl)} />
        </div>
      </Box>
      <Box className={classes.stat}>
        <div className={classes.label}>{t('Vaults-Title')}</div>
        <div className={classes.value}>
          <ValueText value={totalActiveVaults} />
        </div>
      </Box>
      <Modal open={isTvlModalOpen} onClose={handleTvlModalClose}>
        <ModalTvl close={handleTvlModalClose} />
      </Modal>
    </Grid>
  );
};
