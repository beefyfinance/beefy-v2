import { Button, makeStyles } from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { useTranslation } from 'react-i18next';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';
import { Bridge } from '../../../../components/Bridge';

const useStyles = makeStyles(styles);

export function VaultBuyLinks({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.btnContainer}>
      {vault.buyTokenUrl && (
        <Button
          href={vault.buyTokenUrl}
          target="_blank"
          rel="noreferrer"
          className={classes.btnSecondary}
          endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
        >
          {t('Transact-BuyTkn')}
        </Button>
      )}
      {vault.addLiquidityUrl && (
        <Button
          href={vault.addLiquidityUrl}
          target="_blank"
          rel="noreferrer"
          className={classes.btnSecondary}
          endIcon={<OpenInNewRoundedIcon fontSize="small" htmlColor="#D0D0DA" />}
        >
          {t('Transact-AddLiquidity')}
        </Button>
      )}
      {vault.assetIds.includes('BIFI') && <Bridge buttonClassname={classes.btnSecondary} />}
    </div>
  );
}
