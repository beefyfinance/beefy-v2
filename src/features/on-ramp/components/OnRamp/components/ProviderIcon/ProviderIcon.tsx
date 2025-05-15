import { memo } from 'react';
import { getOnRampProviderIcon } from '../../../../../../helpers/onrampProviderSrc.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type ProviderIconProps = {
  provider: string;
  width?: number;
  css?: CssStyles;
};
export const ProviderIcon = memo(function CurrencyFlag({
  provider,
  css: cssProp,
  width = 24,
}: ProviderIconProps) {
  const src = getOnRampProviderIcon(provider);

  return src ?
      <img src={src} width={width} height={width} alt={provider} className={css(cssProp)} />
    : null;
});
