import React, { memo } from 'react';
import { getCurrencyFlag } from '../../../../../../helpers/flagSrc';

export type CurrencyFlagProps = {
  currencyCode: string;
  width?: number;
  className?: string;
};
export const CurrencyFlag = memo<CurrencyFlagProps>(function CurrencyFlag({
  currencyCode,
  className,
  width = 24,
}) {
  const src = getCurrencyFlag(currencyCode);
  const height = ((width / 48) * 32).toFixed(2);

  return src ? (
    <img src={src} width={width} height={height} alt={currencyCode} className={className} />
  ) : null;
});
