import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../../../components/LinkButton';
import { useAppSelector } from '../../../../../../store';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type WithdrawLinksProps = {
  className?: string;
};
export const WithdrawLinks = memo<WithdrawLinksProps>(({ className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const hasLinks = vault.removeLiquidityUrl;

  if (!hasLinks) {
    return null;
  }

  return (
    <div className={clsx(classes.btnContainer, className)}>
      {vault.removeLiquidityUrl && (
        <LinkButton href={vault.removeLiquidityUrl} text={t('Transact-RemoveLiquidity')} />
      )}
    </div>
  );
});
