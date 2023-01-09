import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactQuote } from '../../../../../data/apis/transact/transact-types';
import { isTokenNative } from '../../../../../data/entities/token';

export type MaxNativeProps = {
  quote: TransactQuote;
  onChange: (shouldDisable: boolean) => void;
  className?: string;
};
export const MaxNativeNotice = memo<MaxNativeProps>(function MaxNativeNotice({
  quote,
  onChange,
  className,
}) {
  const { t } = useTranslation();
  const maxNativeInputs = useMemo(() => {
    return quote.inputs.filter(tokenAmount => tokenAmount.max && isTokenNative(tokenAmount.token));
  }, [quote]);
  const isMaxNative = useMemo(() => maxNativeInputs.length > 0, [maxNativeInputs]);

  useEffect(() => {
    onChange(isMaxNative);
  }, [isMaxNative, onChange]);

  if (!isMaxNative) {
    return null;
  }

  return (
    <AlertError className={className}>
      <p>{t('Transact-Notice-MaxNative', { token: maxNativeInputs[0].token.symbol })}</p>
    </AlertError>
  );
});
