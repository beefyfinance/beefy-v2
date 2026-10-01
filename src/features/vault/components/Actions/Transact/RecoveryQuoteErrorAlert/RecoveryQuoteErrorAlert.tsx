import type { CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectCrossChainRecoveryQuoteError,
  selectCrossChainRecoveryQuoteStatus,
} from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { QuoteErrorAlert } from '../QuoteErrorAlert/QuoteErrorAlert.tsx';

export type RecoveryQuoteErrorAlertProps = {
  action: 'deposit' | 'withdraw';
  css?: CssStyles;
};

export const RecoveryQuoteErrorAlert = memo(function RecoveryQuoteErrorAlert({
  action,
  css: cssProp,
}: RecoveryQuoteErrorAlertProps) {
  const status = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const error = useAppSelector(selectCrossChainRecoveryQuoteError);

  if (status !== TransactStatus.Rejected || !error) {
    return null;
  }

  // recovery re-quotes from its own "fetch new quote" button, so there's no countdown to point at
  return <QuoteErrorAlert error={error} action={action} autoRetry={false} css={cssProp} />;
});
