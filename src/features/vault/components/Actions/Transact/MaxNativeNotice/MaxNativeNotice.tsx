import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { isTokenNative } from '../../../../../data/entities/token.ts';
import { type CssStyles } from '@repo/styles/css';

export type MaxNativeProps = {
  quote: TransactQuote;
  css?: CssStyles;
};
export const MaxNativeNotice = memo(function MaxNativeNotice({
  quote,
  css: cssProp,
}: MaxNativeProps) {
  const { t } = useTranslation();
  const maxNativeInputs = useMemo(() => {
    return quote.inputs.filter(tokenAmount => tokenAmount.max && isTokenNative(tokenAmount.token));
  }, [quote]);
  const isMaxNative = maxNativeInputs.length > 0;

  if (!isMaxNative) {
    return null;
  }

  return (
    <AlertError css={cssProp}>
      <p>{t('Transact-Notice-MaxNative', { token: maxNativeInputs[0].token.symbol })}</p>
    </AlertError>
  );
});
