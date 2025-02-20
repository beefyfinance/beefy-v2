import { memo } from 'react';
import { getNetworkSrc } from '../../helpers/networkSrc';
import type { ChainEntity } from '../../features/data/entities/chain';

export type ChainIconProps = {
  chainId: ChainEntity['id'];
  className?: string;
  size?: number;
};
export const ChainIcon = memo<ChainIconProps>(function ChainIcon({
  chainId,
  className,
  size = 24,
}) {
  const src = getNetworkSrc(chainId);

  return src ? (
    <img src={src} width={size} height={size} alt={chainId} className={className} />
  ) : null;
});
