import React, { memo } from 'react';
import { getTransactProviderIcon } from '../../../../../../helpers/transactProviderSrc';

export type ProviderIconProps = {
  provider: string;
  width?: number;
  className?: string;
};
export const ProviderIcon = memo<ProviderIconProps>(function ProviderIcon({
  provider,
  className,
  width = 24,
}) {
  const src = getTransactProviderIcon(provider);

  return src ? (
    <img src={src} width={width} height={width} alt={provider} className={className} />
  ) : null;
});
