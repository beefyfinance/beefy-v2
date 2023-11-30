import React, { memo } from 'react';
import { getTransactProviderIcon } from '../../../../../../helpers/transactProviderSrc';
import zapIconSrc from '../../../../../../images/icons/zap.svg';

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
  const src = provider === 'default' ? zapIconSrc : getTransactProviderIcon(provider);

  return (
    <img src={src || zapIconSrc} width={width} height={width} alt={''} className={className} />
  );
});
