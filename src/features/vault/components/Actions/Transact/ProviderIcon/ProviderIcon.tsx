import { memo } from 'react';
import { getTransactProviderIcon } from '../../../../../../helpers/transactProviderSrc.ts';
import zapIconSrc from '../../../../../../images/icons/zap.svg';
import { css, type CssStyles } from '@repo/styles/css';

export type ProviderIconProps = {
  provider: string;
  width?: number;
  css?: CssStyles;
};
export const ProviderIcon = memo(function ProviderIcon({
  provider,
  css: cssProp,
  width = 24,
}: ProviderIconProps) {
  const src = provider === 'default' ? zapIconSrc : getTransactProviderIcon(provider);

  return (
    <img src={src || zapIconSrc} width={width} height={width} alt={''} className={css(cssProp)} />
  );
});
