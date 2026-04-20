import { memo, type CSSProperties } from 'react';
import { getNetworkSrc } from '../../helpers/networkSrc.ts';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type ChainIconProps = {
  chainId: ChainEntity['id'];
  css?: CssStyles;
  size?: number;
  style?: CSSProperties;
};

export const ChainIcon = memo(function ChainIcon({
  chainId,
  css: cssProp,
  size = 24,
  style,
}: ChainIconProps) {
  const src = getNetworkSrc(chainId);

  return src ?
      <img
        src={src}
        width={size}
        height={size}
        alt={chainId}
        className={css({ width: `${size}px`, height: `${size}px`, flexShrink: 0 }, cssProp)}
        style={style}
      />
    : null;
});
