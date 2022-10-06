import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { Bridge } from '../../../../../../components/Bridge';
import { LinkButton } from '../../../../../../components/LinkButton';
import clsx from 'clsx';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type DepositBuyLinksProps = {
  className?: string;
};
export const DepositBuyLinks = memo<DepositBuyLinksProps>(function DepositBuyLinks({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const hasLinks = vault.buyTokenUrl || vault.addLiquidityUrl || vault.assetIds.includes('BIFI');

  if (!hasLinks) {
    return null;
  }

  return (
    <div className={clsx(classes.btnContainer, className)}>
      {vault.buyTokenUrl && <LinkButton href={vault.buyTokenUrl} text={t('Transact-BuyTkn')} />}
      {vault.addLiquidityUrl && (
        <LinkButton href={vault.addLiquidityUrl} text={t('Transact-AddLiquidity')} />
      )}
      {vault.assetIds.includes('BIFI') && <Bridge buttonClassname={classes.btnSecondary} />}
    </div>
  );
});
