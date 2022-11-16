import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type VaultFeesProps = {
  className?: string;
};
export const VaultFees = memo<VaultFeesProps>(function DepositBuyLinks({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return <div className={className}>TODO: fees</div>;
});
