import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactCrossChainPreflight,
  selectTransactMode,
} from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export type CrossChainBelowFeeNoticeProps = {
  css?: CssStyles;
};

export const CrossChainBelowFeeNotice = memo(function CrossChainBelowFeeNotice({
  css: cssProp,
}: CrossChainBelowFeeNoticeProps) {
  const { t } = useTranslation();
  const preflightOk = useAppSelector(selectTransactCrossChainPreflight);
  const mode = useAppSelector(selectTransactMode);

  if (preflightOk) {
    return null;
  }

  const action = mode === TransactMode.Deposit ? 'deposit' : 'withdraw';
  return (
    <AlertError css={cssProp}>{t(`Transact-Quote-Error-CrossChain-TooLow-${action}`)}</AlertError>
  );
});
