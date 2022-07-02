import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';
import { Bridge } from '../../../../components/Bridge';
import { LinkButton } from '../../../../components/LinkButton';

const useStyles = makeStyles(styles);

export function VaultBuyLinks({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.btnContainer}>
      {vault.buyTokenUrl && <LinkButton href={vault.buyTokenUrl} text={t('Transact-BuyTkn')} />}
      {vault.addLiquidityUrl && (
        <LinkButton href={vault.addLiquidityUrl} text={t('Transact-AddLiquidity')} />
      )}
      {vault.assetIds.includes('BIFI') && <Bridge buttonClassname={classes.btnSecondary} />}
    </div>
  );
}
