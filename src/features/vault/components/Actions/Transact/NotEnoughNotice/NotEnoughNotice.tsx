import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts';
import { useAppSelector } from '../../../../../../store';
import {
  selectTransactDepositInputAmountExceedsBalance,
  selectTransactWithdrawInputAmountExceedsBalance,
} from '../../../../../data/selectors/transact';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet';

export type NotEnoughProps = {
  onChange: (shouldDisable: boolean) => void;
  mode: 'deposit' | 'withdraw';
  className?: string;
};
export const NotEnoughNotice = memo<NotEnoughProps>(function NotEnoughNotice({
  onChange,
  className,
  mode,
}) {
  const { t } = useTranslation();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const inputAmountExceedsBalance = useAppSelector(
    mode === 'deposit'
      ? selectTransactDepositInputAmountExceedsBalance
      : selectTransactWithdrawInputAmountExceedsBalance
  );

  useEffect(() => {
    onChange(inputAmountExceedsBalance);
  }, [inputAmountExceedsBalance, onChange]);

  if (!inputAmountExceedsBalance || !isWalletConnected) {
    return null;
  }

  return (
    <AlertError className={className}>
      <p>{t('Transact-Notice-NotEnough')}</p>
    </AlertError>
  );
});
