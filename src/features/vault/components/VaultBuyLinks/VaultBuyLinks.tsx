import { Box, Button, makeStyles } from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { Bridge } from '../../../../components/Bridge';

const useStyles = makeStyles(styles);

export function VaultBuyLinks({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.btnContaniner}>
      <>
        {vault.buyTokenUrl && (
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
        )}
        {vault.addLiquidityUrl && (
          <a
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
        )}
        {vault.assetIds.includes('BIFI') && <Bridge buttonClassname={classes.btnSecondary1} />}
      </>
    </Box>
  );
}
