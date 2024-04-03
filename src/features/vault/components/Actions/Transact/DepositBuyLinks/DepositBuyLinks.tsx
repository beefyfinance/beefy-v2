import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { LinkButton } from '../../../../../../components/LinkButton';
import clsx from 'clsx';
import { memo } from 'react';
import {
  selectTransactNumTokens,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type DepositBuyLinksProps = {
  className?: string;
};
export const DepositBuyLinks = memo<DepositBuyLinksProps>(function DepositBuyLinks({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);

  const showLinks = vault.addLiquidityUrl && numTokenOptions === 1;

  if (!showLinks) {
    return null;
  }

  return (
    <div className={clsx(classes.btnContainer, className)}>
      {vault.addLiquidityUrl && (
        <LinkButton href={vault.addLiquidityUrl} text={t('Transact-BuildLp')} />
      )}
    </div>
  );
});
