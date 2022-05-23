import { useCallback, useState } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { Bridge } from '../../../../components/Bridge';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);

export function VaultBuyLinks({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const [openBridgeModal, setOpenBridgeModal] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setOpenBridgeModal(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpenBridgeModal(true);
  }, []);

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.btnContaniner}>
      <>
        {vault.buyTokenUrl && (
          <a
            style={{ marginRight: '8px' }}
            href={vault.buyTokenUrl}
            target="_blank"
            rel="noreferrer"
            className={classes.btnSecondary}
          >
            <Button
              size="small"
              endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
            >
              {t('Transact-BuyTkn')}
            </Button>
          </a>
        )}
        {vault.addLiquidityUrl && (
          <a
            href={vault.addLiquidityUrl}
            style={{ marginRight: '8px' }}
            target="_blank"
            rel="noreferrer"
            className={classes.btnSecondary}
          >
            <Button
              size="small"
              endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
            >
              {t('Transact-AddLiquidity')}
            </Button>
          </a>
        )}
        {vault.assetIds.includes('BIFI') && (
          <>
            <Button
              className={clsx({
                [classes.btnSecondary1]: true,
                [classes.marginButton]: vault.addLiquidityUrl && vault.buyTokenUrl,
              })}
              onClick={handleOpen}
              size="small"
            >
              {t('Transact-Bridge')}
            </Button>
            <Bridge open={openBridgeModal} handleClose={handleClose} />
          </>
        )}
      </>
    </Box>
  );
}
