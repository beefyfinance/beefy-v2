import { memo } from 'react';
import { getNetworkSrc } from '../../helpers/networkSrc.ts';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type ChainIconProps = {
  chainId: ChainEntity['id'];
  css?: CssStyles;
  size?: number;
};

export const ChainIcon = memo(function ChainIcon({
  chainId,
  css: cssProp,
  size = 24,
}: ChainIconProps) {
  const src = getNetworkSrc(chainId);

  return src ?
      <img src={src} width={size} height={size} alt={chainId} className={css(cssProp)} />
    : null;
});
