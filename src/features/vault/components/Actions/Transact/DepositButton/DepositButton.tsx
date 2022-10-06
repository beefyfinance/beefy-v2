import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppSelector } from '../../../../../../store';
import { selectTransactInputAmount } from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type DepositButtonProps = {
  className?: string;
};
export const DepositButton = memo<DepositButtonProps>(function DepositButton({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Button
      variant="success"
      disabled={true}
      fullWidth={true}
      borderless={true}
      className={className}
    >
      {t('Transaction-Deposit')}
    </Button>
  );
});
