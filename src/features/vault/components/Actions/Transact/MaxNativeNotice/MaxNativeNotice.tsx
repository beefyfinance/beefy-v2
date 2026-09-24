import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { type CssStyles } from '@repo/styles/css';
import { useMaxGasTokenSymbol } from '../hooks/useActionGates.ts';

export type MaxNativeProps = {
  quote: TransactQuote;
  css?: CssStyles;
};
export const MaxNativeNotice = memo(function MaxNativeNotice({
  quote,
  css: cssProp,
}: MaxNativeProps) {
  const { t } = useTranslation();
  const maxGasTokenSymbol = useMaxGasTokenSymbol(quote);

  if (!maxGasTokenSymbol) {
    return null;
  }

  return (
    <AlertError css={cssProp}>
      <p>{t('Transact-Notice-MaxNative', { token: maxGasTokenSymbol })}</p>
    </AlertError>
  );
});
