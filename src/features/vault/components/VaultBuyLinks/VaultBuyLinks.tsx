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

const useStyles = makeStyles(styles as any);

export function VaultBuyLinks({
  vaultId,
  isMaxi,
}: {
  vaultId: VaultEntity['id'];
  isMaxi: boolean;
}) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {!isMaxi && (
        <Box>
          {vault.buyTokenUrl && !vault.addLiquidityUrl && (
            <a
              href={vault.buyTokenUrl}
              target="_blank"
              rel="noreferrer"
              className={classes.btnSecondary}
            >
              <Button endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}>
                {t('Transact-BuyTkn')}
              </Button>
            </a>
          )}
          {vault.addLiquidityUrl && !vault.buyTokenUrl && (
            <a
              href={vault.addLiquidityUrl}
              target="_blank"
              rel="noreferrer"
              className={classes.btnSecondary}
            >
              <Button endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}>
                {t('Transact-AddLiquidity')}
              </Button>
            </a>
          )}
        </Box>
      )}
    </>
  );
}

export function VaultBuyLinks2({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {vault.buyTokenUrl && vault.addLiquidityUrl && (
        <Box className={classes.btnContaniner}>
          <a
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
          <a
            style={{ marginLeft: '12px' }}
            href={vault.addLiquidityUrl}
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
        </Box>
      )}
    </>
  );
}

export function VaultBuyLinks3({
  vaultId,
  isMaxi,
}: {
  vaultId: VaultEntity['id'];
  isMaxi: boolean;
}) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setOpenModal(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpenModal(true);
  }, []);

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {vault.buyTokenUrl && isMaxi && (
        <>
          <Box className={classes.btnContaniner}>
            <a
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
            <Button
              size="small"
              className={classes.btnSecondary1}
              endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
              onClick={handleOpen}
            >
              {t('Transact-Bridge')}
            </Button>
          </Box>
          <Bridge open={openModal} handleClose={handleClose} />
        </>
      )}
    </>
  );
}
