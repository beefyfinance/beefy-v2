import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types';
import { useAppSelector } from '../../../../../../store';
import { selectTransactSelected } from '../../../../../data/selectors/transact';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';

export type AmountExceedsBalanceNoticeProps = {
  quote: TransactQuote;
  onChange: (shouldDisable: boolean) => void;
  className?: string;
};
export const AmountExceedsBalanceNotice = memo<AmountExceedsBalanceNoticeProps>(
  function AmountExceedsBalanceNotice({ onChange, className, quote }) {
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection.tokens[0];
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );

    const { t } = useTranslation();

    const isAmountExceedsBalance = useMemo(() => {
      return quote.inputs[0].amount.gt(userBalance);
    }, [quote.inputs, userBalance]);

    useEffect(() => {
      onChange(isAmountExceedsBalance);
    }, [isAmountExceedsBalance, onChange]);

    if (!isAmountExceedsBalance) {
      return null;
    }

    return (
      <AlertError className={className}>
        <p>{t('Transact-Notice-AmountExceedsBalance')}</p>
      </AlertError>
    );
  }
);
