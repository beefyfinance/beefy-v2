import React, { memo } from 'react';
import { getOnRampProviderIcon } from '../../../../../../helpers/onrampProviderSrc';

export type ProviderIconProps = {
  provider: string;
  width?: number;
  className?: string;
};
export const ProviderIcon = memo<ProviderIconProps>(function CurrencyFlag({
  provider,
  className,
  width = 24,
}) {
  const src = getOnRampProviderIcon(provider);

  return src ? (
    <img src={src} width={width} height={width} alt={provider} className={className} />
  ) : null;
});
